"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { uploadMedia } from "@/lib/storage/uploadMedia";

export type UploadResumeState = { error: string | null };

async function notifyPublicSiteChanged() {
  revalidateTag("resume", "max");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function uploadResumeAction(
  _prevState: UploadResumeState,
  formData: FormData
): Promise<UploadResumeState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const label = (formData.get("label") as string)?.trim() || null;
  const externalUrl = (formData.get("externalUrl") as string)?.trim() || null;
  const file = formData.get("file");
  const makeActive = formData.get("makeActive") === "on";

  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && !externalUrl) {
    return { error: "Provide either a file to upload or an external URL." };
  }
  if (hasFile && externalUrl) {
    return { error: "Choose one: a file upload OR an external URL, not both." };
  }

  let mediaId: string | undefined;
  if (hasFile) {
    const result = await uploadMedia(file as File, admin.user.id);
    if (!result.ok) return { error: result.error };
    mediaId = result.media.id;
  }

  if (makeActive) {
    await prisma.resume.updateMany({ where: { isActive: true }, data: { isActive: false } });
  }

  const created = await prisma.resume.create({
    data: {
      label,
      mediaId: mediaId ?? null,
      externalUrl: hasFile ? null : externalUrl,
      isActive: makeActive,
    },
  });

  await logAudit({
    action: "resume.created",
    actorId: admin.user.id,
    resourceType: "Resume",
    resourceId: created.id,
    ip,
    metadata: { label, isActive: makeActive, type: hasFile ? "FILE" : "LINK" },
  });

  await notifyPublicSiteChanged();
  revalidatePath("/admin/resume");
  return { error: null };
}

export async function setActiveResumeAction(resumeId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.$transaction([
    prisma.resume.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.resume.update({ where: { id: resumeId }, data: { isActive: true } }),
  ]);

  await logAudit({
    action: "resume.activated",
    actorId: admin.user.id,
    resourceType: "Resume",
    resourceId: resumeId,
    ip,
  });

  await notifyPublicSiteChanged();
  revalidatePath("/admin/resume");
}

export async function softDeleteResumeAction(resumeId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.resume.update({ where: { id: resumeId }, data: { deletedAt: new Date(), isActive: false } });

  await logAudit({
    action: "resume.deleted",
    actorId: admin.user.id,
    resourceType: "Resume",
    resourceId: resumeId,
    ip,
  });

  await notifyPublicSiteChanged();
  revalidatePath("/admin/resume");
}
