"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { educationSchema, parseCoursework } from "@/lib/validation/education";

export type SaveEducationState = { error: string | null; fieldErrors?: Record<string, string> };

function extractEducationInput(formData: FormData) {
  return {
    school: formData.get("school") as string,
    degree: formData.get("degree") as string,
    location: formData.get("location") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    coursework: formData.get("coursework") as string,
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
  revalidateTag("education", "max");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function saveEducationAction(
  educationId: string | null,
  _prevState: SaveEducationState,
  formData: FormData
): Promise<SaveEducationState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = educationSchema.safeParse(extractEducationInput(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;
  const payload = {
    school: data.school,
    degree: data.degree,
    location: data.location || null,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    coursework: parseCoursework(data.coursework),
    published: data.published,
  };

  let savedId = educationId;

  if (educationId) {
    await prisma.education.update({ where: { id: educationId }, data: payload });
    await logAudit({
      action: "education.updated",
      actorId: admin.user.id,
      resourceType: "Education",
      resourceId: educationId,
      ip,
    });
  } else {
    const maxOrder = await prisma.education.aggregate({ _max: { displayOrder: true } });
    const created = await prisma.education.create({
      data: { ...payload, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
    });
    savedId = created.id;
    await logAudit({
      action: "education.created",
      actorId: admin.user.id,
      resourceType: "Education",
      resourceId: created.id,
      ip,
    });
  }

  await notifyPublicSiteChanged();
  redirect(`/admin/education/${savedId}`);
}

export async function softDeleteEducationAction(educationId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.education.update({
    where: { id: educationId },
    data: { deletedAt: new Date(), published: false },
  });
  await logAudit({
    action: "education.deleted",
    actorId: admin.user.id,
    resourceType: "Education",
    resourceId: educationId,
    ip,
  });

  await notifyPublicSiteChanged();
  redirect("/admin/education");
}

export async function toggleEducationPublishedAction(educationId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.education.findUniqueOrThrow({ where: { id: educationId } });
  await prisma.education.update({ where: { id: educationId }, data: { published: !item.published } });
  await logAudit({
    action: "education.published_toggled",
    actorId: admin.user.id,
    resourceType: "Education",
    resourceId: educationId,
    metadata: { published: !item.published },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/education");
}

export async function moveEducationAction(educationId: string, direction: "up" | "down") {
  await requireAdminAction();

  const current = await prisma.education.findUniqueOrThrow({ where: { id: educationId } });
  const neighbor = await prisma.education.findFirst({
    where: {
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.education.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.education.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);

  await notifyPublicSiteChanged();
  revalidatePath("/admin/education");
}
