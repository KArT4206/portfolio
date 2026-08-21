"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { awardSchema } from "@/lib/validation/award";

export type SaveAwardState = { error: string | null; fieldErrors?: Record<string, string> };

function extractAwardInput(formData: FormData) {
  return {
    title: formData.get("title") as string,
    organization: formData.get("organization") as string,
    detail: formData.get("detail") as string,
    year: formData.get("year") as string,
    certificateUrl: formData.get("certificateUrl") as string,
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
  revalidateTag("awards", "max");
  revalidatePath("/");
}

export async function saveAwardAction(
  awardId: string | null,
  _prevState: SaveAwardState,
  formData: FormData
): Promise<SaveAwardState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = awardSchema.safeParse(extractAwardInput(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;

  const certificateFile = formData.get("certificateFile");
  let certificateMediaId: string | undefined;
  if (certificateFile instanceof File && certificateFile.size > 0) {
    const result = await uploadMedia(certificateFile, admin.user.id);
    if (!result.ok) return { error: result.error };
    certificateMediaId = result.media.id;
  }

  const payload = {
    title: data.title,
    organization: data.organization || null,
    detail: data.detail || null,
    year: data.year ?? null,
    certificateUrl: data.certificateUrl || null,
    featured: data.featured,
    published: data.published,
    ...(certificateMediaId ? { certificateMediaId } : {}),
  };

  let savedId = awardId;

  if (awardId) {
    await prisma.award.update({ where: { id: awardId }, data: payload });
    await logAudit({
      action: "award.updated",
      actorId: admin.user.id,
      resourceType: "Award",
      resourceId: awardId,
      ip,
    });
  } else {
    const maxOrder = await prisma.award.aggregate({ _max: { displayOrder: true } });
    const created = await prisma.award.create({
      data: { ...payload, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
    });
    savedId = created.id;
    await logAudit({
      action: "award.created",
      actorId: admin.user.id,
      resourceType: "Award",
      resourceId: created.id,
      ip,
    });
  }

  await notifyPublicSiteChanged();
  redirect(`/admin/awards/${savedId}`);
}

export async function softDeleteAwardAction(awardId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.award.update({ where: { id: awardId }, data: { deletedAt: new Date(), published: false } });
  await logAudit({
    action: "award.deleted",
    actorId: admin.user.id,
    resourceType: "Award",
    resourceId: awardId,
    ip,
  });

  await notifyPublicSiteChanged();
  redirect("/admin/awards");
}

export async function removeAwardCertificateAction(awardId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.award.update({ where: { id: awardId }, data: { certificateMediaId: null } });
  await logAudit({
    action: "award.certificate_removed",
    actorId: admin.user.id,
    resourceType: "Award",
    resourceId: awardId,
    ip,
  });

  await notifyPublicSiteChanged();
  revalidatePath(`/admin/awards/${awardId}`);
}

export async function toggleAwardFeaturedAction(awardId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.award.findUniqueOrThrow({ where: { id: awardId } });
  await prisma.award.update({ where: { id: awardId }, data: { featured: !item.featured } });
  await logAudit({
    action: "award.featured_toggled",
    actorId: admin.user.id,
    resourceType: "Award",
    resourceId: awardId,
    metadata: { featured: !item.featured },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/awards");
}

export async function toggleAwardPublishedAction(awardId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.award.findUniqueOrThrow({ where: { id: awardId } });
  await prisma.award.update({ where: { id: awardId }, data: { published: !item.published } });
  await logAudit({
    action: "award.published_toggled",
    actorId: admin.user.id,
    resourceType: "Award",
    resourceId: awardId,
    metadata: { published: !item.published },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/awards");
}

export async function moveAwardAction(awardId: string, direction: "up" | "down") {
  await requireAdminAction();

  const current = await prisma.award.findUniqueOrThrow({ where: { id: awardId } });
  const neighbor = await prisma.award.findFirst({
    where: {
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.award.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.award.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);

  await notifyPublicSiteChanged();
  revalidatePath("/admin/awards");
}
