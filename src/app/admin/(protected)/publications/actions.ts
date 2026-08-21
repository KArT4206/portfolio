"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { publicationSchema, parseAuthors, parseKeywords } from "@/lib/validation/publication";

export type SavePublicationState = { error: string | null; fieldErrors?: Record<string, string> };

function extractPublicationInput(formData: FormData) {
  return {
    title: formData.get("title") as string,
    authors: formData.get("authors") as string,
    journal: formData.get("journal") as string,
    publicationDate: formData.get("publicationDate") as string,
    doi: formData.get("doi") as string,
    url: formData.get("url") as string,
    status: formData.get("status") as string,
    abstract: formData.get("abstract") as string,
    keywords: formData.get("keywords") as string,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  };
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

async function notifyPublicSiteChanged() {
  revalidateTag("publications", "max");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function savePublicationAction(
  publicationId: string | null,
  _prevState: SavePublicationState,
  formData: FormData
): Promise<SavePublicationState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = publicationSchema.safeParse(extractPublicationInput(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;
  const payload = {
    title: data.title,
    authors: parseAuthors(data.authors),
    journal: data.journal || null,
    publicationDate: data.publicationDate ?? null,
    doi: data.doi || null,
    url: data.url || null,
    status: data.status,
    abstract: data.abstract || null,
    keywords: parseKeywords(data.keywords),
    featured: data.featured,
    published: data.published,
  };

  let savedId = publicationId;

  if (publicationId) {
    await prisma.publication.update({ where: { id: publicationId }, data: payload });
    await logAudit({
      action: "publication.updated",
      actorId: admin.user.id,
      resourceType: "Publication",
      resourceId: publicationId,
      ip,
    });
  } else {
    const maxOrder = await prisma.publication.aggregate({ _max: { displayOrder: true } });
    const created = await prisma.publication.create({
      data: { ...payload, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
    });
    savedId = created.id;
    await logAudit({
      action: "publication.created",
      actorId: admin.user.id,
      resourceType: "Publication",
      resourceId: created.id,
      ip,
    });
  }

  await notifyPublicSiteChanged();
  redirect(`/admin/publications/${savedId}`);
}

export async function softDeletePublicationAction(publicationId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.publication.update({
    where: { id: publicationId },
    data: { deletedAt: new Date(), published: false },
  });
  await logAudit({
    action: "publication.deleted",
    actorId: admin.user.id,
    resourceType: "Publication",
    resourceId: publicationId,
    ip,
  });

  await notifyPublicSiteChanged();
  redirect("/admin/publications");
}

export async function togglePublicationFeaturedAction(publicationId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.publication.findUniqueOrThrow({ where: { id: publicationId } });
  await prisma.publication.update({ where: { id: publicationId }, data: { featured: !item.featured } });
  await logAudit({
    action: "publication.featured_toggled",
    actorId: admin.user.id,
    resourceType: "Publication",
    resourceId: publicationId,
    metadata: { featured: !item.featured },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/publications");
}

export async function togglePublicationPublishedAction(publicationId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.publication.findUniqueOrThrow({ where: { id: publicationId } });
  await prisma.publication.update({ where: { id: publicationId }, data: { published: !item.published } });
  await logAudit({
    action: "publication.published_toggled",
    actorId: admin.user.id,
    resourceType: "Publication",
    resourceId: publicationId,
    metadata: { published: !item.published },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/publications");
}

export async function movePublicationAction(publicationId: string, direction: "up" | "down") {
  await requireAdminAction();

  const current = await prisma.publication.findUniqueOrThrow({ where: { id: publicationId } });
  const neighbor = await prisma.publication.findFirst({
    where: {
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.publication.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.publication.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);

  await notifyPublicSiteChanged();
  revalidatePath("/admin/publications");
}

export type UploadPublicationAttachmentState = { error: string | null };

export async function uploadPublicationAttachmentAction(
  publicationId: string,
  _prevState: UploadPublicationAttachmentState,
  formData: FormData
): Promise<UploadPublicationAttachmentState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const file = formData.get("file");
  const label = (formData.get("label") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const visibility = formData.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";

  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (!label) return { error: 'Give the attachment a label (e.g. "PDF Preprint").' };

  const result = await uploadMedia(file, admin.user.id);
  if (!result.ok) return { error: result.error };

  const maxOrder = await prisma.publicationAttachment.aggregate({
    where: { publicationId },
    _max: { displayOrder: true },
  });

  await prisma.publicationAttachment.create({
    data: {
      publicationId,
      mediaId: result.media.id,
      label,
      description,
      visibility,
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
    },
  });

  await logAudit({
    action: "attachment.uploaded",
    actorId: admin.user.id,
    resourceType: "PublicationAttachment",
    resourceId: publicationId,
    ip,
    metadata: { label, mimeType: result.media.mimeType, size: result.media.size },
  });

  await notifyPublicSiteChanged();
  revalidatePath(`/admin/publications/${publicationId}`);
  return { error: null };
}

export async function deletePublicationAttachmentAction(attachmentId: string, publicationId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.publicationAttachment.delete({ where: { id: attachmentId } });

  await logAudit({
    action: "attachment.deleted",
    actorId: admin.user.id,
    resourceType: "PublicationAttachment",
    resourceId: attachmentId,
    ip,
  });

  await notifyPublicSiteChanged();
  revalidatePath(`/admin/publications/${publicationId}`);
}
