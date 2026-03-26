import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function requireUserId(): Promise<{ userId: string } | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId: user.userId };
}
