"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { projectSchema, slugify, parseTechnologies } from "@/lib/validation/project";

export type SaveProjectState = { error: string | null; fieldErrors?: Record<string, string> };

function extractProjectInput(formData: FormData) {
  return {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    shortDescription: formData.get("shortDescription") as string,
    detailedDescription: formData.get("detailedDescription") as string,
    role: formData.get("role") as string,
    technologies: formData.get("technologies") as string,
    githubUrl: formData.get("githubUrl") as string,
    demoUrl: formData.get("demoUrl") as string,
    docsUrl: formData.get("docsUrl") as string,
    paperUrl: formData.get("paperUrl") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    status: formData.get("status") as string,
    categories: formData.getAll("categories") as string[],
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
  // "max" = invalidate immediately regardless of any configured max age —
  // see the same note in src/app/api/github/webhook/route.ts.
  revalidateTag("projects", "max");
  revalidatePath("/");
  revalidatePath("/projects", "layout");
}

export async function saveProjectAction(
  projectId: string | null,
  _prevState: SaveProjectState,
  formData: FormData
): Promise<SaveProjectState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = projectSchema.safeParse(extractProjectInput(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.title);

  const existingWithSlug = await prisma.project.findUnique({ where: { slug } });
  if (existingWithSlug && existingWithSlug.id !== projectId) {
    return { error: null, fieldErrors: { slug: "This slug is already in use by another project." } };
  }

  const coverFile = formData.get("coverImage");
  let coverImageId: string | undefined;
  if (coverFile instanceof File && coverFile.size > 0) {
    const result = await uploadMedia(coverFile, admin.user.id);
    if (!result.ok) {
      return { error: result.error };
    }
    coverImageId = result.media.id;
  }

  const payload = {
    title: data.title,
    slug,
    shortDescription: data.shortDescription,
    detailedDescription: data.detailedDescription || null,
    role: data.role || null,
    technologies: parseTechnologies(data.technologies),
    githubUrl: data.githubUrl || null,
    demoUrl: data.demoUrl || null,
    docsUrl: data.docsUrl || null,
    paperUrl: data.paperUrl || null,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    status: data.status,
    categories: data.categories,
    featured: data.featured,
    published: data.published,
    ...(coverImageId ? { coverImageId } : {}),
  };

  let savedId = projectId;

  if (projectId) {
    await prisma.project.update({ where: { id: projectId }, data: payload });
    await logAudit({
      action: "project.updated",
      actorId: admin.user.id,
      resourceType: "Project",
      resourceId: projectId,
      ip,
      metadata: { slug },
    });
  } else {
    const maxOrder = await prisma.project.aggregate({ _max: { displayOrder: true } });
    const created = await prisma.project.create({
      data: { ...payload, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
    });
    savedId = created.id;
    await logAudit({
      action: "project.created",
      actorId: admin.user.id,
      resourceType: "Project",
      resourceId: created.id,
      ip,
      metadata: { slug },
    });
  }

  await notifyPublicSiteChanged();
  redirect(`/admin/projects/${savedId}`);
}

export async function softDeleteProjectAction(projectId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.project.update({ where: { id: projectId }, data: { deletedAt: new Date(), published: false } });
  await logAudit({
    action: "project.deleted",
    actorId: admin.user.id,
    resourceType: "Project",
    resourceId: projectId,
    ip,
  });

  await notifyPublicSiteChanged();
  redirect("/admin/projects");
}

export async function toggleFeaturedAction(projectId: string) {
  const admin = await requireAdminAction();
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  await prisma.project.update({ where: { id: projectId }, data: { featured: !project.featured } });
  await logAudit({
    action: "project.featured_toggled",
    actorId: admin.user.id,
    resourceType: "Project",
    resourceId: projectId,
    metadata: { featured: !project.featured },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/projects");
}

export async function togglePublishedAction(projectId: string) {
  const admin = await requireAdminAction();
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  await prisma.project.update({ where: { id: projectId }, data: { published: !project.published } });
  await logAudit({
    action: "project.published_toggled",
    actorId: admin.user.id,
    resourceType: "Project",
    resourceId: projectId,
    metadata: { published: !project.published },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/projects");
}

export async function moveProjectAction(projectId: string, direction: "up" | "down") {
  await requireAdminAction();

  const current = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const neighbor = await prisma.project.findFirst({
    where: {
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return; // already at the boundary

  await prisma.$transaction([
    prisma.project.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.project.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);

  await notifyPublicSiteChanged();
  revalidatePath("/admin/projects");
}

export type UploadAttachmentState = { error: string | null };

export async function uploadAttachmentAction(
  projectId: string,
  _prevState: UploadAttachmentState,
  formData: FormData
): Promise<UploadAttachmentState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const file = formData.get("file");
  const label = (formData.get("label") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const visibility = formData.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";

  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (!label) return { error: "Give the attachment a label (e.g. \"IEEE Paper\")." };

  const result = await uploadMedia(file, admin.user.id);
  if (!result.ok) return { error: result.error };

  const maxOrder = await prisma.projectAttachment.aggregate({
    where: { projectId },
    _max: { displayOrder: true },
  });

  await prisma.projectAttachment.create({
    data: {
      projectId,
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
    resourceType: "ProjectAttachment",
    resourceId: projectId,
    ip,
    metadata: { label, mimeType: result.media.mimeType, size: result.media.size },
  });

  await notifyPublicSiteChanged();
  revalidatePath(`/admin/projects/${projectId}`);
  return { error: null };
}

export async function deleteAttachmentAction(attachmentId: string, projectId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.projectAttachment.delete({ where: { id: attachmentId } });

  await logAudit({
    action: "attachment.deleted",
    actorId: admin.user.id,
    resourceType: "ProjectAttachment",
    resourceId: attachmentId,
    ip,
  });

  await notifyPublicSiteChanged();
  revalidatePath(`/admin/projects/${projectId}`);
}
