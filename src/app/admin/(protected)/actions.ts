"use server";

import { redirect } from "next/navigation";
import { getCurrentAdmin, revokeCurrentSession, requestMeta } from "@/lib/auth/session";
import { logAudit } from "@/lib/auth/audit";

export async function logoutAction() {
  const admin = await getCurrentAdmin();
  const { ip } = await requestMeta();

  await revokeCurrentSession();

  if (admin) {
    await logAudit({
      action: "auth.logout",
      actorId: admin.user.id,
      resourceType: "AdminUser",
      resourceId: admin.user.id,
      ip,
    });
  }

  redirect("/admin/login");
}
