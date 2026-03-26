# Decision log

This document records **why** we chose certain approaches for **Intake triage**, with extra detail for work completed in the final MVP stretch (roughly the last session). The **original prompt** called for a small app that:

- Captures **project intakes** (structured fields plus narrative).
- Lets users **review** their submissions in a list and open detail.
- Applies **AI** for summaries, tags, and risk-style signals.
- Enforces **per-user data isolation** (users see only their intakes).
- Provides an **admin** experience to see **all intakes** (with submitter context), **all users**, and practical **export** for review workflows.
- Ships in a way **non-engineers can run** (Docker-first, clear README, seed data).

Everything below is written as **decisions + rationale**, not a feature list.

---

## Baseline architecture (earlier in the project)

### Next.js App Router + SQLite + Prisma

**Decision:** Use **Next.js** (App Router) with **Prisma** and **SQLite**.

**Why:** Fits a challenge-sized MVP: one process, file-based DB, simple deploy story, strong typing from schema to app code. SQLite matches “single tenant demo” without operating a separate database server. Prisma keeps migrations/schema evolution readable for reviewers.

### Docker as the default run path

**Decision:** Treat **Docker Compose** as the primary way to run the app; document host Node only as optional.

**Why:** The prompt implied reviewers who may not maintain a local Node toolchain. Pinning **Node 20** in the dev image avoids “works on my machine” drift. Named volumes for **`node_modules`** and the DB file avoid slow bind-mount installs and keep the DB inside Docker’s filesystem as intended.

### `dev_node_modules` volume + source bind mount

**Decision:** Bind-mount the repo to `/app`, but mount a **named volume** on `/app/node_modules`.

**Why:** Performance and stability on macOS bind mounts. **Important follow-up:** an empty or partial `node_modules` volume must not be mistaken for a complete install (see [Onboarding and seed](#onboarding-and-seed) below). We explicitly avoid persisting `.next` in a separate volume so dev chunk paths stay consistent with the live tree (this addressed real “missing chunk” dev errors).

### iron-session + bcryptjs

**Decision:** **iron-session** for signed/encrypted cookies; **bcryptjs** for password hashes.

**Why:** Minimal session store (no Redis requirement) suitable for SQLite-backed demos; bcrypt for standard password handling without native build friction in slim Node images.

### MUI + a small Next `Link` bridge

**Decision:** Use **MUI** for UI, and a dedicated **`MuiNextLink`** (or equivalent) where MUI expects a component ref/`component` prop combined with **Next.js `Link`**.

**Why:** Mixing MUI `Button`/`Typography` `component={Link}` with Next 15 led to runtime errors (`... is not a function`) when refs or the `Link` contract did not match what MUI forwarded. A thin adapter keeps list/detail navigation correct without fighting the framework.

### AI enrichment: async job + retries

**Decision:** Run enrichment **after** create/update (non-blocking from the user’s perspective where possible), with **retry/backoff** and an optional **fallback model** env.

**Why:** OpenAI calls fail transiently (rate limits, blips). Retries improve demo reliability; a fallback model env avoids a hard failure when the primary model is unavailable. Keeping enrichment out of the critical path of the HTTP request reduces perceived latency and timeouts.

### Admin surface and CSV

**Decision:** Admin routes gated by **`is_admin`**; **CSV** export for the “all intakes” grid.

**Why:** Matches the prompt’s staff/review scenario. CSV is universal for reviewers and avoids building a full reporting UI.

---

## Final MVP stretch (recent session) — detailed decisions

### 1. Startup test gate (`test:gate`, Vitest, `predev` / `prestart`)

**Decision:** Add a **mandatory** check before the app listens: `prisma validate` plus **`vitest run`**, wired as **`npm run test:gate`**, invoked from **`predev`** and **`prestart`**, and from **Docker** dev/prod entrypoints where appropriate.

**Why:** The explicit MVP ask was: *basic tests that run prior to the app launching; if a test fails, block startup.* npm lifecycle hooks are a simple, framework-native way to ensure `next dev` / `next start` do not run when the gate fails. Including **`prisma validate`** catches broken schema early (cheap, no DB required). Vitest keeps the suite fast and TypeScript-friendly without pulling in a browser runner for this scope.

**Trade-off:** Local `npm run dev` on a dirty schema or broken unit test will not start the server until fixed — intentional. Production builds that run `npm run start` will re-run the gate unless adjusted (we treated that as desirable for defense in depth).

### 2. What the gate tests actually assert

**Decision:** Combine a **production-only** environment rule with a few **pure unit** tests:

- **Production session secret:** If `NODE_ENV === "production"`, require **`SESSION_SECRET`** length ≥ 32. In development, skip — so local Docker dev stays frictionless while production cannot boot with a missing/short secret.
- **CSV helpers:** RFC-style escaping / line building used by export paths.
- **OpenAI retry helper:** Which HTTP statuses are retriable and that backoff is capped — documents intent and prevents silent regressions in resilience logic.

**Why:** The gate is not “full E2E”; it is **fast, deterministic, and aligned with security + data-export correctness + AI reliability**, which were core themes of the build. A heavy Playwright suite would be valuable later but violated the “short tests before boot” constraint.

### 3. Vitest 2.x pin

**Decision:** Pin **Vitest 2.1.x** rather than Vitest 3.

**Why:** Developers (and some CI sandboxes) still hit **Node 16** or **Node 18**; Vitest 3 / Vite 7 tightened Node requirements. The app itself already expects modern Node for Next 15, but keeping the test runner on a slightly wider Node floor reduced avoidable install failures while Docker remained the canonical environment.

### 4. README documentation for tests

**Decision:** Document **`npm run test`** vs **`npm run test:gate`**, list test files and purposes, and explain Docker + production behavior.

**Why:** Reviewers were explicitly in scope for the README. Without this section, the gate looks like “magic failures” when `SESSION_SECRET` is missing in prod.

### 5. `SESSION_SECRET` in local `.env` (generated)

**Decision:** Generate a **32-character** random secret and place it in **`.env`** (never committed).

**Why:** Satisfies production gate mentally for “real” deploys, keeps local cookie signing stable, and demonstrates the expected shape of configuration. **`.env.example`** remains the template without real secrets.

### 6. Onboarding script + `docker compose down -v` workflow

**Decision:** Maintain **`scripts/onboard.sh`** (and `npm run onboard`) as the one-shot path: ensure `.env`, start **`dev`**, wait for health, **`npm install` if needed**, **`db push`**, **`db:seed`**.

**Why:** Matches the “reviewer runs one script” story. **`down -v`** reset is documented as the way to wipe **named volumes** (SQLite + `node_modules` volume) for a truly clean rerun.

### 7. Prisma seed: `tsx` invocation (`ENOENT` / `MODULE_NOT_FOUND`)

**Decision:** Change the Prisma seed command to run the **local** TS runner explicitly:

`node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts`

…and tighten onboarding’s “deps present?” check to require **both** `next` **and** `tsx` under `node_modules/.bin`.

**Why (two separate bugs):**

1. **ENOENT:** Prisma executes the configured seed command in a way that did not reliably resolve **`tsx`** on `PATH` (`spawn tsx ENOENT`) even when dependencies existed.
2. **`npx tsx` pitfall:** Using **`npx tsx`** could pull an **ephemeral** `tsx` that executed **outside** the project’s module graph, causing **`Cannot find module 'bcryptjs'`** for `prisma/seed.ts` imports.

Invoking the **project-installed** `tsx` CLI via `node` avoids both. The onboarding check was previously “**next** exists → skip install,” which was **wrong** after a fresh `dev_node_modules` volume: partial or stale layouts could pass the check while **`tsx`** (a devDependency) was missing.

### 8. CSV export button placement and empty state

**Decision:** Move **Export CSV** into a header component shown on **`/admin`** for **all** states, including **zero intakes**; export then downloads a **header-only** CSV when there are no rows. Consolidate CSV row building in **`lib/admin-intakes-csv.ts`** using **`toCsvLine`** from **`lib/csv`**.

**Why:** The button had lived only above the data table and was **not rendered** when the empty-state card showed — reviewers concluded CSV “was missing.” Putting export beside the page title makes the feature discoverable and matches mental models (“export this report”) even when the table is empty.

### 9. Pushing to `main` and release artifact zip

**Decision:** Commit the full application tree to **`main`** on the remote and offer a **`git archive`** zip for handoff.

**Why:** Single branch simplicity for a challenge repo. **`git archive`** produces a **small, reproducible** artifact: exactly tracked sources, **no** `node_modules`, **no** `.next`, **no** `.env`, **no** `.git` — appropriate for email/upload without leaking secrets or huge binaries.

### 10. `.gitignore` hygiene

**Decision:** Ignore **`.env`**, local SQLite files, **`node_modules`**, **`.next`**, and **`*.tsbuildinfo`**.

**Why:** Prevent accidental credential leakage and keep review noise down. The zip and clone flows assume secrets are created locally from **`.env.example`**.

---

## Summary

We optimized for **reviewer success** (Docker, README, onboard script, seed data), **credible admin workflows** (all intakes, users, CSV), **reliable AI demos** (retries, fallback model), and a **hard MVP bar** on quality (**schema validate + tests block boot**, **production session secret enforced**). The last session focused on making that bar **visible, documented, and operable** end-to-end — including fixing real friction (**seed `tsx`**, **CSV discoverability**, **clean reset + install** semantics) that only showed up under volume wipes and Prisma’s process model.
