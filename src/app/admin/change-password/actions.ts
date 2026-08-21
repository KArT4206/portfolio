"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentAdmin, hashToken, requestMeta } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { logAudit } from "@/lib/auth/audit";

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(10, "New password must be at least 10 characters."),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New password and confirmation don't match.",
    path: ["confirmPassword"],
  });

export type ChangePasswordState = { error: string | null };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const user = await prisma.adminUser.findUnique({ where: { id: admin.user.id } });
  if (!user) redirect("/admin/login");

  const currentOk = await verifyPassword(user!.passwordHash, parsed.data.currentPassword);
  if (!currentOk) {
    return { error: "Current password is incorrect." };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  const { ip } = await requestMeta();

  await prisma.adminUser.update({
    where: { id: admin.user.id },
    data: { passwordHash: newHash, mustChangePassword: false },
  });

  // Invalidate every other session so a leaked temporary password can't
  // keep an unattended session alive elsewhere — only the session that
  // just proved the current password stays valid.
  const store = await cookies();
  const currentRawToken = store.get(SESSION_COOKIE_NAME)?.value;
  await prisma.adminSession.updateMany({
    where: {
      userId: admin.user.id,
      revokedAt: null,
      ...(currentRawToken ? { tokenHash: { not: hashToken(currentRawToken) } } : {}),
    },
    data: { revokedAt: new Date() },
  });

  await logAudit({
    action: "auth.password_changed",
    actorId: admin.user.id,
    resourceType: "AdminUser",
    resourceId: admin.user.id,
    ip,
  });

  redirect("/admin");
}
