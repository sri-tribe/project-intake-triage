# Intake triage

A small web app for **capturing project intakes** (title, description, budget, timeline, industry), **reviewing them in a list**, and getting **AI-generated summaries, tags, and risk checklists** for each one. People sign in with their own account and only see **their** intakes. **Admins** can open a separate area to see **everyone’s** intakes and a directory of **all users**.

This README is written for testers and reviewers who may not write code day to day. If you follow the steps in order, you can run the app locally with **Docker** only (no need to install Node.js on your computer).

---

## What you need installed

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** for **macOS** or **Linux**  
   - Install it, start it, and wait until it says Docker is running.  
2. A **web browser** (Chrome, Firefox, Safari, etc.).  
3. (Optional but recommended) A **text editor** to edit **`.env`** (e.g. TextEdit, VS Code, or `nano`).

You do **not** need Node.js, npm, or a database server installed on your machine; the Docker setup provides all of that inside containers.

---

## Fastest setup — automated onboarding script

If **Docker Desktop is running**, you can run **one script** from the project folder. It will:

1. Create **`.env`** from **`.env.example`** if you don’t already have a `.env` (it will **not** overwrite an existing `.env`).  
2. Start the **dev** container in the background (`docker compose up -d dev`).  
3. Wait until the container is ready.  
4. Run **`npm install`** inside the container **only if** dependencies are missing (common the first time because of Docker’s `node_modules` volume).  
5. Run **`prisma db push`** to sync the database schema.  
6. Run **`npm run db:seed`** to add the admin, demo users, sample intakes, and (if **`OPENAI_API_KEY`** is in your `.env`) AI enrichment.

**After it finishes**, open **http://localhost:3000** in your browser.

### Run the script

```bash
cd project-intake-triage   # use your actual folder name
bash scripts/onboard.sh
```

Optional: `chmod +x scripts/onboard.sh` once, then `./scripts/onboard.sh`.

If you already have **Node** and **npm** installed:

```bash
npm run onboard
```

### Before or after: add your OpenAI key (optional)

Edit **`.env`** and set **`OPENAI_API_KEY=`** if you want AI summaries and the chat assistant. If you add it **after** the script ran, run seed again so sample intakes get enriched:

```bash
docker compose exec dev npm run db:seed
```

### View logs or stop the app

- Logs: `docker compose logs -f dev`  
- Stop: `docker compose down`

---

## Quick start (first time) — manual steps

### 1. Get the project on your computer

If you received a **ZIP file**, unzip it into a folder (for example `project-intake-triage`).

If you use **Git**:

```bash
git clone <repository-url>
cd project-intake-triage
```

From here on, all terminal commands should be run **from this project folder** (the one that contains `docker-compose.yml`).

### 2. Create your environment file

1. In the project folder, find the file **`.env.example`**.  
2. **Copy** it and rename the copy to **`.env`** (exactly that name, with the leading dot).  
   - On Mac/Linux you can run: `cp .env.example .env`  
3. Open **`.env`** in a text editor.

**Important lines:**

| Line | What it does |
|------|----------------|
| `OPENAI_API_KEY` | If you **paste a real API key** from [OpenAI](https://platform.openai.com/), the app can **generate AI summaries** for intakes and power the **floating assistant**. If you leave it empty, the app still runs, but AI features will be limited or show messages about the key. |
| `SESSION_SECRET` | Used to sign login cookies. For **local Docker dev** you can leave it blank; the app uses a built-in dev default. For **production** or **`docker compose --profile prod`**, you **must** set a random secret of **at least 32 characters** or the **startup tests** will fail and the app will not launch. |

Save the file.

> **Docker note:** When you use `docker compose`, variables from **`.env`** in this folder are passed into the container for things like `OPENAI_API_KEY`. The database file used by the app in Docker is **not** the `DATABASE_URL` line in `.env` for local file paths — Docker overrides that to use a database inside a Docker volume (`/app/data/app.db`). That’s expected.

### 3. Start the app with Docker

Open **Terminal** (or your usual shell), go to the project folder, and run:

```bash
docker compose up dev
```

- The **first** time, Docker may take several minutes to **download** and **build** images.  
- When you see logs mentioning **Next.js** and **Ready**, the app is usually up.

Leave this terminal window open while you use the app. To stop the server, press **Ctrl+C** in that window.

### 4. Open the app in your browser

Go to:

**http://localhost:3000**

If you see a security or “connection refused” message, wait a bit longer for the first build to finish, then refresh.

### 5. Prepare the database and (optional) sample data

The dev container tries to sync the database schema when it starts. To be sure everything is applied and to load **demo users and intakes**, open a **second** terminal in the same project folder and run:

```bash
docker compose exec dev npx prisma db push
docker compose exec dev npm run db:seed
```

- **`db push`** updates the SQLite schema to match the project (safe for local dev).  
- **`db:seed`** creates a **default admin**, **three demo users**, **nine sample intakes**, and — if `OPENAI_API_KEY` is set — runs **AI enrichment** on those intakes (same as when you create an intake in the UI).

**Default accounts after seeding** (change these in production; documented in `.env.example`):

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@intake.local` | `ChangeMeAdmin!23` |
| Demo users (same password for all three) | `alex.morgan@demo.intake`, `sam.okonkwo@demo.intake`, `riley.park@demo.intake` | `DemoUserPass!23` |

---

## How to use the app (features)

### Home page

- Short description of the product.  
- If you’re **not** logged in, you’ll see **Log in** and **Create account**.  
- If you **are** logged in, you’ll see shortcuts to **View intakes** and **New intake**.

### Creating an account

1. Click **Register** (or **Create account**).  
2. Enter **name**, **email**, and **password** (at least 8 characters).  
3. After registering, you’re signed in and taken to your intakes list.

### Logging in and out

- Use **Log in** with your email and password.  
- **Log out** is in the top navigation bar.  
- **Admins** are sent to the **Admin** area after login; everyone else goes to **Intakes**.

### Intakes (regular users)

- **Intakes** — list of intakes **you** created (title, industry, date).  
- **New intake** — form to add title, description, budget, timeline, industry.  
- After saving, the app may send you home with a success message while **AI enrichment** runs in the background (if an API key is configured).  
- Click an intake to open the **detail** page: AI summary, tags, risk checklist (when available), and editable fields. You can **edit** or **delete** your own intakes.

### AI assistant (floating button)

- A **floating button** (bottom-right) opens a chat-style **assistant**.  
- You can ask for help wording intakes, risks, or summaries.  
- This needs a valid **`OPENAI_API_KEY`** in `.env` for Docker.

### Admin area (staff only)

Some accounts are marked **admin** in the database (`is_admin`). The seeded **admin** user has this flag.

- In the header, admins see an **Admin** button.  
- **`/admin`** — table of **all intakes** from **all users**, with submitter name and email. Click a title to view details (read-only for other people’s intakes).  
- **`/admin/users`** — list of **all registered users** (no passwords shown).  

Non-admins who try to open `/admin` are redirected away.

### Loading, empty, and error states (what you should see)

The UI is built to give clear feedback in common situations:

| Situation | What you’ll see |
|-----------|------------------|
| **Loading** | While a page is opening, many routes show a **skeleton** placeholder (gray animated blocks) instead of a blank screen — for example **Intakes**, **intake detail**, **New intake**, **Log in / Register**, and **Admin** pages. |
| **Saving** | On **New intake**, fields **disable** while saving and a **spinner + “Saving your intake…”** line appears. **Log in** and **Register** show a **spinner on the button** and disabled fields while the request runs. |
| **Empty** | **Intakes** with no items shows a short explanation and a **Create your first intake** button. **Admin** tables explain when there are no intakes or no users yet. |
| **Errors (forms)** | **Log in**, **Register**, and **New intake** show a **red alert** with the message from the server (or a generic network error). Editing an intake on the detail page shows errors the same way. |
| **Errors (page crash)** | If a page hits an unexpected error, you’ll see **Something went wrong** with the error message, a **Try again** button, and **Home**. (You shouldn’t see this in normal use.) |

The **AI assistant** shows a spinner while it waits for a reply; failed replies appear as assistant messages with an error description.

### Making someone an admin (without seed)

1. Use a database tool or Prisma Studio:  
   `docker compose exec dev npx prisma studio`  
   (opens a web UI; check Prisma docs for the exact URL, often **http://localhost:5555**.)  
2. Open the **`users`** table, find the user, set **`is_admin`** to **true**.  
3. Ask that person to **log out and log in again** so their session picks up the change.

---

## Useful commands (copy-paste)

Run these from the **project folder** with Docker Desktop running.

| Goal | Command |
|------|---------|
| Start dev server | `docker compose up dev` |
| Start in background | `docker compose up -d dev` |
| Stop | `Ctrl+C` or `docker compose down` |
| Apply database schema | `docker compose exec dev npx prisma db push` |
| Load / refresh seed data + AI on samples | `docker compose exec dev npm run db:seed` |
| Open database in a browser UI | `docker compose exec dev npx prisma studio` |
| Clear Next.js cache if the app errors oddly | `npm run clean` (on the host) or delete the `.next` folder, then restart `docker compose up dev` |
| Run unit + gate tests only | `docker compose exec dev npm run test` |
| Run schema validation + all tests (same as startup gate) | `docker compose exec dev npm run test:gate` |

If you have **Node.js 18+** on the host, you can run **`npm run test`** or **`npm run test:gate`** from the project folder instead of `docker compose exec dev …`.

---

## Automated tests (startup gate)

The project includes a small **Vitest** suite that must **pass before the app starts**. If any test fails, **`npm run dev`** and **`npm run start`** exit without launching Next.js (this is wired with npm **`predev`** / **`prestart`** hooks).

| Script | What it does |
|--------|----------------|
| **`npm run test`** | Runs **`vitest run`** — all files under **`tests/`**. |
| **`npm run test:gate`** | Runs **`prisma validate`** (schema must be valid), then the same Vitest run. This is what runs on startup. |

**What the tests cover:**

| Area | File | Purpose |
|------|------|---------|
| **Gate (production)** | `tests/gate/production-session.test.ts` | When **`NODE_ENV`** is **`production`**, **`SESSION_SECRET`** must be set and at least **32 characters**. Otherwise the process fails so the app cannot start with an unsafe session configuration. |
| **Unit** | `tests/unit/csv.test.ts` | CSV building / escaping used for admin export. |
| **Unit** | `tests/unit/openai-retry.test.ts` | Retry helper for OpenAI-style HTTP errors (which statuses retry, delay cap). |

**Docker:** The **dev** image runs **`npm run test:gate`** before **`next dev`**. The **production** image runs **`test:gate`** during the image build and again when the container runs **`npm run start`** (so a bad deploy or runtime env still hits the gate).

In **development**, the session-secret test **does not apply** unless you set **`NODE_ENV=production`** locally.

---

## Troubleshooting

### “Port 3000 is already in use”

Something else is using port **3000**. Either stop that program or change the port mapping in `docker-compose.yml` (for example `"3001:3000"`) and open **http://localhost:3001**.

### “Cannot find module …” or random 500 errors after an update

1. Stop Docker (`Ctrl+C`).  
2. Delete the **`.next`** folder in the project (or run `npm run clean` if you have Node on the host).  
3. Start again: `docker compose up dev`.

### I seeded on my computer but Docker doesn’t show users

Seeding with **`npm run db:seed` on the host** (outside Docker) uses the path in `.env` (often `prisma/dev.db`). The **Docker app** uses **`/app/data/app.db`**. Always run seed **inside** the container:

`docker compose exec dev npm run db:seed`

### AI never appears on intakes

- Confirm **`OPENAI_API_KEY`** is set in **`.env`** (no quotes needed usually) and restart `docker compose up dev`.  
- Check you have credits / billing enabled on your OpenAI account.  
- Re-run **`docker compose exec dev npm run db:seed`** after adding the key to enrich sample intakes again.

### Docker says “cannot connect to daemon”

Start **Docker Desktop** and wait until it is fully running, then retry.

---

## Production-style run (optional)

The repo includes a second Compose service **`web`** (production-style image). It is **not** started by default. Advanced users can run:

```bash
docker compose --profile prod up --build web
```

Use a strong **`SESSION_SECRET`** (32+ characters) and proper hosting practices before exposing this to the internet. If the **`web`** container exits immediately, check **`docker compose logs web`** (or image build logs): with **`NODE_ENV=production`**, missing or short **`SESSION_SECRET`** fails the startup gate in **Automated tests (startup gate)**.

---

## Tech stack (for curious readers)

- **Next.js** (App Router) — web framework  
- **React** — UI  
- **Material UI (MUI)** — components and dark theme  
- **Prisma** + **SQLite** — data storage (in Docker, DB file lives in a volume under `/app/data`)  
- **iron-session** — encrypted/signed HTTP-only session cookies  
- **bcryptjs** — password hashing  
- **OpenAI API** — intake enrichment and assistant chat  

---

## License / challenge note

This project was created as part of a coding challenge. Adjust license and deployment notes here if you open-source or ship it.
