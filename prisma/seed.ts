/**
 * Seeds admin, demo users, sample intakes, then runs the same OpenAI enrichment as the app.
 * Run: npx prisma db seed   or   npm run db:seed
 *
 * Requires OPENAI_API_KEY for enrichment (optional — seed still succeeds without it).
 */
import bcrypt from "bcryptjs";
import { isAiConfigured } from "@/lib/ai-config";
import { runIntakeEnrichmentJob } from "@/lib/enrichment-job";
import { getPrisma } from "@/lib/prisma";

const ROUNDS = 10;

function logDatabaseHint() {
  const url = process.env.DATABASE_URL || "";
  console.log(`[seed] DATABASE_URL: ${url || "(unset — Prisma loads .env)"}`);
  if (url.includes("data/app") || url.includes("/app/data")) {
    console.log("[seed] Using Docker-style DB path (matches docker compose `dev` service).");
  } else if (url.includes("prisma")) {
    console.log(
      "[seed] Using a local prisma/ path. If the app runs in Docker with compose, run this seed inside the container instead.",
    );
  }
}

const DEMO_USERS = [
  {
    email: "alex.morgan@demo.intake",
    name: "Alex Morgan",
    intakes: [
      {
        title: "Customer onboarding portal",
        description:
          "Self-serve signup with identity verification, plan selection, and guided setup. Need SSO later but not in v1.",
        budgetRange: "$80k–$120k",
        timeline: "Launch by end of Q2",
        industry: "FinTech / SaaS",
      },
      {
        title: "API rate-limit dashboard",
        description:
          "Internal tool for support and SRE to view tenant usage, adjust limits, and export incident reports.",
        budgetRange: "$35k–$55k",
        timeline: "8–10 weeks",
        industry: "Software",
      },
      {
        title: "Expense tracking mobile MVP",
        description:
          "iOS-first MVP: capture receipts, categorize spend, export to CSV. Integrations with one accounting tool TBD.",
        budgetRange: "$95k–$140k",
        timeline: "3–4 months",
        industry: "Consumer apps",
      },
    ],
  },
  {
    email: "sam.okonkwo@demo.intake",
    name: "Sam Okonkwo",
    intakes: [
      {
        title: "HIPAA-aligned patient intake forms",
        description:
          "Replace paper packets with tablets in waiting rooms. Must support e-sign, insurance capture, and audit logs.",
        budgetRange: "$110k–$160k",
        timeline: "Pilot in one clinic by September",
        industry: "Healthcare",
      },
      {
        title: "Volunteer scheduling redesign",
        description:
          "Coordinators need shift swaps, reminders, and capacity views. ~200 active volunteers across three sites.",
        budgetRange: "$25k–$40k",
        timeline: "6 weeks for phase 1",
        industry: "Nonprofit",
      },
      {
        title: "Annual impact report microsite",
        description:
          "Story-driven single-page site with embedded video, donor stats, and downloadable PDF. Brand refresh in parallel.",
        budgetRange: "$18k–$28k",
        timeline: "Deliver before fiscal year-end",
        industry: "Nonprofit",
      },
    ],
  },
  {
    email: "riley.park@demo.intake",
    name: "Riley Park",
    intakes: [
      {
        title: "Handheld inventory scanner + POS bridge",
        description:
          "Warehouse team uses Zebra devices; need real-time sync with Shopify POS and nightly reconciliation job.",
        budgetRange: "$70k–$95k",
        timeline: "Holiday season readiness",
        industry: "Retail",
      },
      {
        title: "Staff training checklist app",
        description:
          "Role-based modules, manager sign-off, and PDF certificates. ~45 stores, mix of iOS and shared Android tablets.",
        budgetRange: "$42k–$60k",
        timeline: "Rollout over 2 months post-MVP",
        industry: "Retail",
      },
      {
        title: "Loyalty pilot (tiered rewards)",
        description:
          "Small cohort test: points, birthday offers, and SMS opt-in. Must plug into existing CRM export.",
        budgetRange: "$55k–$75k",
        timeline: "Pilot 90 days after kickoff",
        industry: "Retail / Marketing",
      },
    ],
  },
] as const;

async function main() {
  logDatabaseHint();

  const prisma = getPrisma();

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@intake.local").toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMeAdmin!23";
  const adminName = process.env.SEED_ADMIN_NAME || "Default Admin";

  const demoPassword = process.env.SEED_DEMO_USER_PASSWORD || "DemoUserPass!23";
  const demoPasswordHash = await bcrypt.hash(demoPassword, ROUNDS);
  const adminHash = await bcrypt.hash(adminPassword, ROUNDS);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, name: adminName, passwordHash: adminHash, isAdmin: true },
    update: { passwordHash: adminHash, isAdmin: true, name: adminName },
  });

  console.log("");
  console.log("Default admin (development only — rotate in shared or production environments):");
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log("");

  console.log("Demo users (same password for all — set SEED_DEMO_USER_PASSWORD to override):");
  console.log(`  Password: ${demoPassword}`);
  console.log("");

  const seededIntakeIds: string[] = [];

  for (const demo of DEMO_USERS) {
    const email = demo.email.toLowerCase();
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: demo.name,
        passwordHash: demoPasswordHash,
        isAdmin: false,
      },
      update: {
        name: demo.name,
        passwordHash: demoPasswordHash,
        isAdmin: false,
      },
    });

    await prisma.intake.deleteMany({ where: { userId: user.id } });

    for (const row of demo.intakes) {
      const intake = await prisma.intake.create({
        data: {
          userId: user.id,
          title: row.title,
          description: row.description,
          budgetRange: row.budgetRange,
          timeline: row.timeline,
          industry: row.industry,
        },
      });
      seededIntakeIds.push(intake.id);
    }

    console.log(`  ${demo.name}`);
    console.log(`    Email:    ${email}`);
    console.log(`    Intakes:  ${demo.intakes.length}`);
  }

  console.log("");

  if (!isAiConfigured()) {
    console.warn(
      "[seed] OPENAI_API_KEY not set — seeded intakes were created without AI summaries. Add the key and run `npm run db:seed` again to enrich.",
    );
  } else {
    console.log(`[seed] Running OpenAI enrichment for ${seededIntakeIds.length} intakes (same pipeline as create/update in the app)...`);
    let succeeded = 0;
    for (let i = 0; i < seededIntakeIds.length; i++) {
      const id = seededIntakeIds[i];
      await runIntakeEnrichmentJob(id);
      const meta = await prisma.intakeAiMetadata.findUnique({
        where: { intakeId: id },
        select: { id: true },
      });
      if (meta) succeeded += 1;
      console.log(`[seed]   [${i + 1}/${seededIntakeIds.length}] ${id.slice(0, 8)}… ${meta ? "enriched" : "no metadata (check logs)"}`);
    }
    console.log(`[seed] Enrichment finished: ${succeeded} / ${seededIntakeIds.length} intakes have AI metadata.`);
  }

  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
