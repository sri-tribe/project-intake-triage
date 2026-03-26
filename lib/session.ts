import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { cache } from "react";

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

/** Stored cookie payload; older sessions may omit `isAdmin`. */
export type SessionData = {
  user?: Omit<SessionUser, "isAdmin"> & { isAdmin?: boolean };
};

/** iron-session requires password length ≥ 32 */
const DEV_FALLBACK = "dev-session-secret-change-me-in-prod!!"; // 32 chars

function getSessionSecret(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK;
  }
  throw new Error("SESSION_SECRET must be set and at least 32 characters in production");
}

export function getSessionOptions(): SessionOptions {
  return {
    password: getSessionSecret(),
    cookieName: "intake_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14,
      path: "/",
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const session = await getSession();
    const u = session.user;
    if (!u) return null;
    return {
      userId: u.userId,
      email: u.email,
      name: u.name,
      isAdmin: u.isAdmin === true,
    };
  } catch {
    return null;
  }
});
