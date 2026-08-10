import "server-only";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export type RateLimitResult = { limited: boolean; retryAfterSeconds?: number };

/**
 * Checks recent failed attempts for both the username and the IP independently —
 * either one tripping the threshold locks the login out. Persisted in Postgres
 * (not in-memory) so the lockout survives serverless cold starts and multiple
 * concurrent instances.
 */
export async function checkLoginRateLimit(username: string, ip: string): Promise<RateLimitResult> {
  const since = new Date(Date.now() - WINDOW_MS);

  const [byUsername, byIp] = await Promise.all([
    prisma.loginAttempt.findMany({
      where: { username: username.toLowerCase(), success: false, attemptedAt: { gte: since } },
      orderBy: { attemptedAt: "asc" },
      take: MAX_ATTEMPTS,
    }),
    prisma.loginAttempt.findMany({
      where: { ip, success: false, attemptedAt: { gte: since } },
      orderBy: { attemptedAt: "asc" },
      take: MAX_ATTEMPTS,
    }),
  ]);

  const oldestRelevant = [byUsername, byIp]
    .filter((attempts) => attempts.length >= MAX_ATTEMPTS)
    .map((attempts) => attempts[0].attemptedAt)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (!oldestRelevant) return { limited: false };

  const retryAfterMs = oldestRelevant.getTime() + WINDOW_MS - Date.now();
  return { limited: true, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
}

export async function recordLoginAttempt(username: string, ip: string, success: boolean) {
  await prisma.loginAttempt.create({
    data: { username: username.toLowerCase(), ip, success },
  });
}
