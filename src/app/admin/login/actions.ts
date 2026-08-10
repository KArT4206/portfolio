"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie, requestMeta } from "@/lib/auth/session";
import { checkLoginRateLimit, recordLoginAttempt } from "@/lib/auth/rateLimit";
import { logAudit } from "@/lib/auth/audit";

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export type LoginState = { error: string | null };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a username and password." };
  }

  const { username, password } = parsed.data;
  const { ip } = await requestMeta();

  const rateLimit = await checkLoginRateLimit(username, ip);
  if (rateLimit.limited) {
    await logAudit({
      action: "auth.login_blocked",
      resourceType: "AdminUser",
      ip,
      result: "FAILURE",
      metadata: { username, reason: "rate_limited" },
    });
    const minutes = Math.ceil((rateLimit.retryAfterSeconds ?? 60) / 60);
    return { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }

  const user = await prisma.adminUser.findUnique({ where: { username: username.toLowerCase() } });

  // Always run a verify call even when the user doesn't exist, against a
  // fixed dummy hash — keeps response timing indistinguishable from a real
  // wrong-password attempt, so this endpoint can't be used to enumerate
  // valid usernames by timing.
  const DUMMY_HASH =
    "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$4Yz8IwOAcVn0iCsUEBcnwvT5lWx3lzR8TWXd+Wtu0Zg";
  const passwordOk = await verifyPassword(user?.passwordHash ?? DUMMY_HASH, password);
  const ok = Boolean(user) && passwordOk;

  await recordLoginAttempt(username, ip, ok);

  if (!ok) {
    await logAudit({
      action: "auth.login_failed",
      resourceType: "AdminUser",
      resourceId: user?.id,
      ip,
      result: "FAILURE",
      metadata: { username },
    });
    return { error: "Incorrect username or password." };
  }

  const { rawToken, expiresAt } = await createSession(user!.id);
  await setSessionCookie(rawToken, expiresAt);
  await prisma.adminUser.update({ where: { id: user!.id }, data: { lastLoginAt: new Date() } });
  await logAudit({
    action: "auth.login",
    actorId: user!.id,
    resourceType: "AdminUser",
    resourceId: user!.id,
    ip,
    result: "SUCCESS",
  });

  redirect("/admin");
}
