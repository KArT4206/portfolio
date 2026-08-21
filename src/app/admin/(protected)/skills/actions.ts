"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { skillGroupSchema, parseSkillItems } from "@/lib/validation/skillGroup";

export type SaveSkillGroupState = { error: string | null; fieldErrors?: Record<string, string> };

function extractSkillGroupInput(formData: FormData) {
  return {
    category: formData.get("category") as string,
    items: formData.get("items") as string,
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
  revalidateTag("skills", "max");
  revalidatePath("/");
}

export async function saveSkillGroupAction(
  skillGroupId: string | null,
  _prevState: SaveSkillGroupState,
  formData: FormData
): Promise<SaveSkillGroupState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = skillGroupSchema.safeParse(extractSkillGroupInput(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;
  const payload = {
    category: data.category,
    items: parseSkillItems(data.items),
    published: data.published,
  };

  let savedId = skillGroupId;

  if (skillGroupId) {
    await prisma.skillGroup.update({ where: { id: skillGroupId }, data: payload });
    await logAudit({
      action: "skill_group.updated",
      actorId: admin.user.id,
      resourceType: "SkillGroup",
      resourceId: skillGroupId,
      ip,
    });
  } else {
    const maxOrder = await prisma.skillGroup.aggregate({ _max: { displayOrder: true } });
    const created = await prisma.skillGroup.create({
      data: { ...payload, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
    });
    savedId = created.id;
    await logAudit({
      action: "skill_group.created",
      actorId: admin.user.id,
      resourceType: "SkillGroup",
      resourceId: created.id,
      ip,
    });
  }

  await notifyPublicSiteChanged();
  redirect(`/admin/skills/${savedId}`);
}

export async function softDeleteSkillGroupAction(skillGroupId: string) {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  await prisma.skillGroup.update({
    where: { id: skillGroupId },
    data: { deletedAt: new Date(), published: false },
  });
  await logAudit({
    action: "skill_group.deleted",
    actorId: admin.user.id,
    resourceType: "SkillGroup",
    resourceId: skillGroupId,
    ip,
  });

  await notifyPublicSiteChanged();
  redirect("/admin/skills");
}

export async function toggleSkillGroupPublishedAction(skillGroupId: string) {
  const admin = await requireAdminAction();
  const item = await prisma.skillGroup.findUniqueOrThrow({ where: { id: skillGroupId } });
  await prisma.skillGroup.update({ where: { id: skillGroupId }, data: { published: !item.published } });
  await logAudit({
    action: "skill_group.published_toggled",
    actorId: admin.user.id,
    resourceType: "SkillGroup",
    resourceId: skillGroupId,
    metadata: { published: !item.published },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/skills");
}

export async function moveSkillGroupAction(skillGroupId: string, direction: "up" | "down") {
  await requireAdminAction();

  const current = await prisma.skillGroup.findUniqueOrThrow({ where: { id: skillGroupId } });
  const neighbor = await prisma.skillGroup.findFirst({
    where: {
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.skillGroup.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.skillGroup.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);

  await notifyPublicSiteChanged();
  revalidatePath("/admin/skills");
}
