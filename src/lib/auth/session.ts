import "server-only";
import { randomBytes, createHash } from "crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export { SESSION_COOKIE_NAME };
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function requestMeta(): Promise<{ ip: string; userAgent: string }> {
  const h = await headers();
  // x-forwarded-for can be a comma-separated chain behind a proxy — the first
  // entry is the original client. Vercel sets this reliably.
  const forwardedFor = h.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const userAgent = h.get("user-agent") ?? "unknown";
  return { ip, userAgent };
}

export async function createSession(userId: string): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const { ip, userAgent } = await requestMeta();

  await prisma.adminSession.create({
    data: { userId, tokenHash, expiresAt, ip, userAgent },
  });

  return { rawToken, expiresAt };
}

export async function setSessionCookie(rawToken: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export type CurrentAdmin = {
  sessionId: string;
  user: { id: string; username: string };
};

/**
 * The authoritative auth check — used by the protected admin layout and by
 * every /api/admin/* route handler. Always hits Postgres (no in-memory or
 * edge-cached shortcut) so a revoked/expired session is rejected immediately,
 * not just after some cache TTL. Cheap enough for a personal-CMS traffic
 * volume; proxy.ts does a cookie-presence-only pre-check purely to avoid
 * rendering a full layout for obviously-logged-out requests — it is NOT the
 * security boundary, this function is.
 */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: { user: { select: { id: true, username: true } } },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;

  return { sessionId: session.id, user: session.user };
}

export async function revokeCurrentSession() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (raw) {
    await prisma.adminSession
      .updateMany({ where: { tokenHash: hashToken(raw) }, data: { revokedAt: new Date() } })
      .catch(() => {});
  }
  await clearSessionCookie();
}
