"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";

const BOOLEAN_KEYS = [
  "funModeEnabled",
  "matrixInteractionEnabled",
  "ghostEnabled",
  "arcadeEnabled",
  "robotEnabled",
  "explorerEnabled",
  "terminalEnabled",
  "idleEventsEnabled",
  "soundDefaultOn",
  "maxWarpEnabled",
] as const;

export async function saveSiteSettingsAction(formData: FormData) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const data = Object.fromEntries(BOOLEAN_KEYS.map((key) => [key, formData.get(key) === "on"]));

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  await logAudit({
    action: "site_settings.updated",
    actorId: admin.user.id,
    resourceType: "SiteSetting",
    resourceId: "singleton",
    ip,
    metadata: data,
  });

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  revalidatePath("/admin/settings");
}
