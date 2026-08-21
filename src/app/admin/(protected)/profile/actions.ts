"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { profileSchema } from "@/lib/validation/profile";

export type SaveProfileState = { error: string | null; fieldErrors?: Record<string, string> };

function extractProfileInput(formData: FormData) {
  return {
    name: formData.get("name") as string,
    initials: formData.get("initials") as string,
    tagline: formData.get("tagline") as string,
    location: formData.get("location") as string,
    email: formData.get("email") as string,
    githubUrl: formData.get("githubUrl") as string,
    linkedinUrl: formData.get("linkedinUrl") as string,
    summary: formData.get("summary") as string,
    heroLine1: formData.get("heroLine1") as string,
    heroLine2: formData.get("heroLine2") as string,
    heroLine3: formData.get("heroLine3") as string,
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

export async function saveProfileAction(
  _prevState: SaveProfileState,
  formData: FormData
): Promise<SaveProfileState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = profileSchema.safeParse(extractProfileInput(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;

  const imageFile = formData.get("profileImage");
  let profileImageId: string | undefined;
  if (imageFile instanceof File && imageFile.size > 0) {
    const result = await uploadMedia(imageFile, admin.user.id);
    if (!result.ok) return { error: result.error };
    profileImageId = result.media.id;
  }

  const payload = {
    name: data.name,
    initials: data.initials,
    tagline: data.tagline,
    location: data.location,
    email: data.email,
    githubUrl: data.githubUrl,
    linkedinUrl: data.linkedinUrl,
    summary: data.summary,
    heroLines: [data.heroLine1 || "", data.heroLine2 || "", data.heroLine3 || ""].filter(Boolean),
    ...(profileImageId ? { profileImageId } : {}),
  };

  await prisma.profile.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...payload },
    update: payload,
  });

  await logAudit({
    action: "profile.updated",
    actorId: admin.user.id,
    resourceType: "Profile",
    resourceId: "singleton",
    ip,
  });

  revalidateTag("profile", "max");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/profile");

  return { error: null };
}
