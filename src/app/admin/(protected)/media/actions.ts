"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { uploadMedia } from "@/lib/storage/uploadMedia";

export type UploadStandaloneMediaState = { error: string | null };

export async function uploadStandaloneMediaAction(
  _prevState: UploadStandaloneMediaState,
  formData: FormData
): Promise<UploadStandaloneMediaState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };

  const result = await uploadMedia(file, admin.user.id);
  if (!result.ok) return { error: result.error };

  await logAudit({
    action: "media.uploaded",
    actorId: admin.user.id,
    resourceType: "Media",
    resourceId: result.media.id,
    ip,
    metadata: { originalName: result.media.originalName, mimeType: result.media.mimeType, size: result.media.size },
  });

  revalidatePath("/admin/media");
  return { error: null };
}

export async function renameMediaAction(mediaId: string, formData: FormData) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const name = (formData.get("originalName") as string)?.trim();
  if (!name) return;

  await prisma.media.update({ where: { id: mediaId }, data: { originalName: name } });

  await logAudit({
    action: "media.renamed",
    actorId: admin.user.id,
    resourceType: "Media",
    resourceId: mediaId,
    ip,
    metadata: { originalName: name },
  });

  revalidatePath("/admin/media");
}

export type DeleteMediaState = { error: string | null };

async function usageCount(mediaId: string) {
  const [projectAttachments, projectCover, researchAttachments, awardCert, certCert, pubAttachments, resumeOf] =
    await Promise.all([
      prisma.projectAttachment.count({ where: { mediaId } }),
      prisma.project.count({ where: { coverImageId: mediaId } }),
      prisma.researchAttachment.count({ where: { mediaId } }),
      prisma.award.count({ where: { certificateMediaId: mediaId } }),
      prisma.certification.count({ where: { certificateMediaId: mediaId } }),
      prisma.publicationAttachment.count({ where: { mediaId } }),
      prisma.resume.count({ where: { mediaId } }),
    ]);
  return projectAttachments + projectCover + researchAttachments + awardCert + certCert + pubAttachments + resumeOf;
}

export async function deleteMediaAction(
  mediaId: string,
  _prevState: DeleteMediaState,
  _formData: FormData
): Promise<DeleteMediaState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const uses = await usageCount(mediaId);
  if (uses > 0) {
    return { error: `Still referenced by ${uses} item${uses === 1 ? "" : "s"} — remove those attachments first.` };
  }

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  await prisma.media.delete({ where: { id: mediaId } });

  await logAudit({
    action: "media.deleted",
    actorId: admin.user.id,
    resourceType: "Media",
    resourceId: mediaId,
    ip,
    metadata: { originalName: media?.originalName },
  });

  revalidatePath("/admin/media");
  return { error: null };
}
