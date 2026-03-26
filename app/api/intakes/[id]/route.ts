import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api-auth";
import { scheduleIntakeEnrichment } from "@/lib/schedule-enrichment";
import { getPrisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function getOwnedIntake(id: string, userId: string) {
  return getPrisma().intake.findFirst({
    where: { id, userId },
    include: { aiMetadata: true },
  });
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const intake = await getOwnedIntake(id, auth.userId);
  if (!intake) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(intake);
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : undefined;
  const description = typeof body?.description === "string" ? body.description : undefined;
  const budgetRange = typeof body?.budgetRange === "string" ? body.budgetRange : undefined;
  const timeline = typeof body?.timeline === "string" ? body.timeline : undefined;
  const industry = typeof body?.industry === "string" ? body.industry : undefined;

  if (title !== undefined && !title) {
    return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
  }

  const existing = await getOwnedIntake(id, auth.userId);
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await getPrisma().intake.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(budgetRange !== undefined ? { budgetRange } : {}),
      ...(timeline !== undefined ? { timeline } : {}),
      ...(industry !== undefined ? { industry } : {}),
    },
  });

  scheduleIntakeEnrichment(id);

  const full = await getOwnedIntake(id, auth.userId);
  if (!full) {
    return NextResponse.json({ error: "failed to load intake" }, { status: 500 });
  }

  return NextResponse.json(full);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await getPrisma().intake.findFirst({ where: { id, userId: auth.userId } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await getPrisma().intake.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
