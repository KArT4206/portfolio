"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { certificationSchema } from "@/lib/validation/certification";

export type SaveCertificationState = { error: string | null; fieldErrors?: Record<string, string> };

function extractCertificationInput(formData: FormData) {
  return {
    name: formData.get("name") as string,
    issuer: formData.get("issuer") as string,
    credentialId: formData.get("credentialId") as string,
    credentialUrl: formData.get("credentialUrl") as string,
    description: formData.get("description") as string,
    issueDate: formData.get("issueDate") as string,
    expiresDate: formData.get("expiresDate") as string,
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
  revalidateTag("certifications", "max");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function saveCertificationAction(
  certificationId: string | null,
  _prevState: SaveCertificationState,
  formData: FormData
): Promise<SaveCertificationState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = certificationSchema.safeParse(extractCertificationInput(formData));
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
    name: data.name,
    issuer: data.issuer,
    credentialId: data.credentialId || null,
    credentialUrl: data.credentialUrl || null,
    description: data.description || null,
    issueDate: data.issueDate ?? null,
    expiresDate: data.expiresDate ?? null,
    published: data.published,
    ...(certificateMediaId ? { certificateMediaId } : {}),
  };

  let savedId = certificationId;

  if (certificationId) {
    await prisma.certification.update({ where: { id: certificationId }, data: payload });
    await logAudit({
      action: "certification.updated",
      actorId: admin.user.id,
      resourceType: "Certification",
      resourceId: certificationId,
      ip,
    });
  } else {
    const maxOrder = await prisma.certification.aggregate({ _max: { displayOrder: true } });
    const created = await prisma.certification.create({
      data: { ...payload, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
    });
    savedId = created.id;
    await logAudit({
      action: "certification.created",
      actorId: admin.user.id,
      resourceType: "Certification",
      resourceId: created.id,
      ip,
    });
  }

  await notifyPublicSiteChanged();
  redirect(`/admin/certifications/${savedId}`);
}

export async function softDeleteCertificationAction(certificationId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.certification.update({
    where: { id: certificationId },
    data: { deletedAt: new Date(), published: false },
  });
  await logAudit({
    action: "certification.deleted",
    actorId: admin.user.id,
    resourceType: "Certification",
    resourceId: certificationId,
    ip,
  });

  await notifyPublicSiteChanged();
  redirect("/admin/certifications");
}

export async function removeCertificationCertificateAction(certificationId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.certification.update({ where: { id: certificationId }, data: { certificateMediaId: null } });
  await logAudit({
    action: "certification.certificate_removed",
    actorId: admin.user.id,
    resourceType: "Certification",
    resourceId: certificationId,
    ip,
  });

  await notifyPublicSiteChanged();
  revalidatePath(`/admin/certifications/${certificationId}`);
}

export async function toggleCertificationPublishedAction(certificationId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.certification.findUniqueOrThrow({ where: { id: certificationId } });
  await prisma.certification.update({ where: { id: certificationId }, data: { published: !item.published } });
  await logAudit({
    action: "certification.published_toggled",
    actorId: admin.user.id,
    resourceType: "Certification",
    resourceId: certificationId,
    metadata: { published: !item.published },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/certifications");
}

export async function moveCertificationAction(certificationId: string, direction: "up" | "down") {
  await requireAdminAction();

  const current = await prisma.certification.findUniqueOrThrow({ where: { id: certificationId } });
  const neighbor = await prisma.certification.findFirst({
    where: {
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.certification.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.certification.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);

  await notifyPublicSiteChanged();
  revalidatePath("/admin/certifications");
}
