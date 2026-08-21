"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { experienceSchema, parseBullets } from "@/lib/validation/experience";

export type SaveExperienceState = { error: string | null; fieldErrors?: Record<string, string> };

function extractExperienceInput(formData: FormData) {
  return {
    org: formData.get("org") as string,
    role: formData.get("role") as string,
    location: formData.get("location") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    bullets: formData.get("bullets") as string,
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
  revalidateTag("experience", "max");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function saveExperienceAction(
  experienceId: string | null,
  _prevState: SaveExperienceState,
  formData: FormData
): Promise<SaveExperienceState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = experienceSchema.safeParse(extractExperienceInput(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;
  const payload = {
    org: data.org,
    role: data.role,
    location: data.location || null,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    bullets: parseBullets(data.bullets),
    published: data.published,
  };

  let savedId = experienceId;

  if (experienceId) {
    await prisma.experience.update({ where: { id: experienceId }, data: payload });
    await logAudit({
      action: "experience.updated",
      actorId: admin.user.id,
      resourceType: "Experience",
      resourceId: experienceId,
      ip,
    });
  } else {
    const maxOrder = await prisma.experience.aggregate({ _max: { displayOrder: true } });
    const created = await prisma.experience.create({
      data: { ...payload, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
    });
    savedId = created.id;
    await logAudit({
      action: "experience.created",
      actorId: admin.user.id,
      resourceType: "Experience",
      resourceId: created.id,
      ip,
    });
  }

  await notifyPublicSiteChanged();
  redirect(`/admin/experience/${savedId}`);
}

export async function softDeleteExperienceAction(experienceId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.experience.update({
    where: { id: experienceId },
    data: { deletedAt: new Date(), published: false },
  });
  await logAudit({
    action: "experience.deleted",
    actorId: admin.user.id,
    resourceType: "Experience",
    resourceId: experienceId,
    ip,
  });

  await notifyPublicSiteChanged();
  redirect("/admin/experience");
}

export async function toggleExperiencePublishedAction(experienceId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.experience.findUniqueOrThrow({ where: { id: experienceId } });
  await prisma.experience.update({ where: { id: experienceId }, data: { published: !item.published } });
  await logAudit({
    action: "experience.published_toggled",
    actorId: admin.user.id,
    resourceType: "Experience",
    resourceId: experienceId,
    metadata: { published: !item.published },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/experience");
}

export async function moveExperienceAction(experienceId: string, direction: "up" | "down") {
  await requireAdminAction();

  const current = await prisma.experience.findUniqueOrThrow({ where: { id: experienceId } });
  const neighbor = await prisma.experience.findFirst({
    where: {
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.experience.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.experience.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);

  await notifyPublicSiteChanged();
  revalidatePath("/admin/experience");
}
