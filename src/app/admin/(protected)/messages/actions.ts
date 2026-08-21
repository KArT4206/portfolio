"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import type { ContactMessageStatus } from "@/generated/prisma/enums";

export async function setMessageStatusAction(id: string, status: ContactMessageStatus) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.contactMessage.update({ where: { id }, data: { status } });

  await logAudit({
    action: "contact_message.status_changed",
    actorId: admin.user.id,
    resourceType: "ContactMessage",
    resourceId: id,
    ip,
    metadata: { status },
  });

  revalidatePath("/admin/messages");
}
