import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = str(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await getPrisma().user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

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
