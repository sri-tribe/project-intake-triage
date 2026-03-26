import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api-auth";
import { scheduleIntakeEnrichment } from "@/lib/schedule-enrichment";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;

  const intakes = await getPrisma().intake.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(intakes);
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(request: Request) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const intake = await getPrisma().intake.create({
    data: {
      title,
      description: str(body?.description),
      budgetRange: str(body?.budgetRange),
      timeline: str(body?.timeline),
      industry: str(body?.industry),
      userId: auth.userId,
    },
  });

  scheduleIntakeEnrichment(intake.id);

  return NextResponse.json(intake, { status: 201 });
}
