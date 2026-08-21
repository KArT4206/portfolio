"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { researchSchema, parseAuthors, parseMetrics } from "@/lib/validation/research";

export type SaveResearchState = { error: string | null; fieldErrors?: Record<string, string> };

function extractResearchInput(formData: FormData) {
  return {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    authors: formData.get("authors") as string,
    conference: formData.get("conference") as string,
    status: formData.get("status") as string,
    year: formData.get("year") as string,
    doi: formData.get("doi") as string,
    paperUrl: formData.get("paperUrl") as string,
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
  revalidateTag("research", "max");
  revalidatePath("/");
}

export async function saveResearchAction(
  researchId: string | null,
  _prevState: SaveResearchState,
  formData: FormData
): Promise<SaveResearchState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = researchSchema.safeParse(extractResearchInput(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;
  const metricLabels = formData.getAll("metricLabel") as string[];
  const metricValues = formData.getAll("metricValue") as string[];
  const metrics = parseMetrics(metricLabels, metricValues);

  const payload = {
    title: data.title,
    description: data.description || null,
    authors: parseAuthors(data.authors),
    conference: data.conference || null,
    status: data.status,
    year: data.year ?? null,
    doi: data.doi || null,
    paperUrl: data.paperUrl || null,
    metrics: metrics as never,
    featured: data.featured,
    published: data.published,
  };

  let savedId = researchId;

  if (researchId) {
    await prisma.research.update({ where: { id: researchId }, data: payload });
    await logAudit({
      action: "research.updated",
      actorId: admin.user.id,
      resourceType: "Research",
      resourceId: researchId,
      ip,
    });
  } else {
    const maxOrder = await prisma.research.aggregate({ _max: { displayOrder: true } });
    const created = await prisma.research.create({
      data: { ...payload, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
    });
    savedId = created.id;
    await logAudit({
      action: "research.created",
      actorId: admin.user.id,
      resourceType: "Research",
      resourceId: created.id,
      ip,
    });
  }

  await notifyPublicSiteChanged();
  redirect(`/admin/research/${savedId}`);
}

export async function softDeleteResearchAction(researchId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.research.update({ where: { id: researchId }, data: { deletedAt: new Date(), published: false } });
  await logAudit({
    action: "research.deleted",
    actorId: admin.user.id,
    resourceType: "Research",
    resourceId: researchId,
    ip,
  });

  await notifyPublicSiteChanged();
  redirect("/admin/research");
}

export async function toggleResearchFeaturedAction(researchId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.research.findUniqueOrThrow({ where: { id: researchId } });
  await prisma.research.update({ where: { id: researchId }, data: { featured: !item.featured } });
  await logAudit({
    action: "research.featured_toggled",
    actorId: admin.user.id,
    resourceType: "Research",
    resourceId: researchId,
    metadata: { featured: !item.featured },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/research");
}

export async function toggleResearchPublishedAction(researchId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.research.findUniqueOrThrow({ where: { id: researchId } });
  await prisma.research.update({ where: { id: researchId }, data: { published: !item.published } });
  await logAudit({
    action: "research.published_toggled",
    actorId: admin.user.id,
    resourceType: "Research",
    resourceId: researchId,
    metadata: { published: !item.published },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/research");
}

export async function moveResearchAction(researchId: string, direction: "up" | "down") {
  await requireAdminAction();

  const current = await prisma.research.findUniqueOrThrow({ where: { id: researchId } });
  const neighbor = await prisma.research.findFirst({
    where: {
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.research.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.research.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);

  await notifyPublicSiteChanged();
  revalidatePath("/admin/research");
}

export type UploadResearchAttachmentState = { error: string | null };

export async function uploadResearchAttachmentAction(
  researchId: string,
  _prevState: UploadResearchAttachmentState,
  formData: FormData
): Promise<UploadResearchAttachmentState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const file = formData.get("file");
  const label = (formData.get("label") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const visibility = formData.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";

  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (!label) return { error: 'Give the attachment a label (e.g. "IEEE Paper").' };

  const result = await uploadMedia(file, admin.user.id);
  if (!result.ok) return { error: result.error };

  const maxOrder = await prisma.researchAttachment.aggregate({
    where: { researchId },
    _max: { displayOrder: true },
  });

  await prisma.researchAttachment.create({
    data: {
      researchId,
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
    resourceType: "ResearchAttachment",
    resourceId: researchId,
    ip,
    metadata: { label, mimeType: result.media.mimeType, size: result.media.size },
  });

  await notifyPublicSiteChanged();
  revalidatePath(`/admin/research/${researchId}`);
  return { error: null };
}

export async function deleteResearchAttachmentAction(attachmentId: string, researchId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.researchAttachment.delete({ where: { id: attachmentId } });

  await logAudit({
    action: "attachment.deleted",
    actorId: admin.user.id,
    resourceType: "ResearchAttachment",
    resourceId: attachmentId,
    ip,
  });

  await notifyPublicSiteChanged();
  revalidatePath(`/admin/research/${researchId}`);
}
