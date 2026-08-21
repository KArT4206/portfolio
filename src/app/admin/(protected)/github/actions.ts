"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/requireAdminAction";
import { logAudit } from "@/lib/auth/audit";
import { requestMeta } from "@/lib/auth/session";

const overrideSchema = z.object({
  alias: z.string().trim().max(200).optional().or(z.literal("")),
  categories: z.string().trim().max(300).optional().or(z.literal("")), // comma-separated
  displayOrder: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(z.number().int().optional())
    .optional(),
  caseStudySlug: z.string().trim().max(200).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  hidden: z.boolean().default(false),
});

export type SaveOverrideState = { error: string | null };

async function notifyPublicSiteChanged() {
  // The GitHub feed itself is still cached under GITHUB_REPOS_CACHE_TAG —
  // presentation-only changes don't need to invalidate the live API cache,
  // just the pages that render it.
  revalidateTag("github-presentation", "max");
  revalidatePath("/");
  revalidatePath("/github");
}

export async function saveOverrideAction(
  repoName: string,
  _prevState: SaveOverrideState,
  formData: FormData
): Promise<SaveOverrideState> {
  const admin = await requireAdminAction();
  const { ip } = await requestMeta();

  const parsed = overrideSchema.safeParse({
    alias: formData.get("alias"),
    categories: formData.get("categories"),
    displayOrder: formData.get("displayOrder"),
    caseStudySlug: formData.get("caseStudySlug"),
    featured: formData.get("featured") === "on",
    hidden: formData.get("hidden") === "on",
  });
  if (!parsed.success) return { error: "Please check the form and try again." };

  const data = parsed.data;
  const categories = data.categories
    ? data.categories.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  await prisma.githubRepoOverride.upsert({
    where: { repoName },
    create: {
      repoName,
      alias: data.alias || null,
      categories,
      displayOrder: data.displayOrder ?? null,
      caseStudySlug: data.caseStudySlug || null,
      featured: data.featured,
      hidden: data.hidden,
    },
    update: {
      alias: data.alias || null,
      categories,
      displayOrder: data.displayOrder ?? null,
      caseStudySlug: data.caseStudySlug || null,
      featured: data.featured,
      hidden: data.hidden,
    },
  });

  await logAudit({
    action: "github_override.saved",
    actorId: admin.user.id,
    resourceType: "GithubRepoOverride",
    resourceId: repoName,
    ip,
    metadata: { repoName },
  });

  await notifyPublicSiteChanged();
  redirect(`/admin/github/${encodeURIComponent(repoName)}`);
}

export async function toggleOverrideFeaturedAction(repoName: string) {
  const admin = await requireAdminAction();
  const existing = await prisma.githubRepoOverride.findUnique({ where: { repoName } });
  await prisma.githubRepoOverride.upsert({
    where: { repoName },
    create: { repoName, featured: true },
    update: { featured: !existing?.featured },
  });
  await logAudit({
    action: "github_override.featured_toggled",
    actorId: admin.user.id,
    resourceType: "GithubRepoOverride",
    resourceId: repoName,
    metadata: { featured: !existing?.featured },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/github");
}

export async function toggleOverrideHiddenAction(repoName: string) {
  const admin = await requireAdminAction();
  const existing = await prisma.githubRepoOverride.findUnique({ where: { repoName } });
  await prisma.githubRepoOverride.upsert({
    where: { repoName },
    create: { repoName, hidden: true },
    update: { hidden: !existing?.hidden },
  });
  await logAudit({
    action: "github_override.hidden_toggled",
    actorId: admin.user.id,
    resourceType: "GithubRepoOverride",
    resourceId: repoName,
    metadata: { hidden: !existing?.hidden },
  });
  await notifyPublicSiteChanged();
  revalidatePath("/admin/github");
}
