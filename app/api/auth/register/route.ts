import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = str(body?.name);
  const email = str(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await getPrisma().user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await getPrisma().user.create({
    data: { name, email, passwordHash },
  });

  const session = await getSession();
  session.user = {
    userId: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
  };
  await session.save();

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
  });
}
