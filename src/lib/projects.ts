import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const CATEGORY_LABELS: Record<string, string> = {
  SOFTWARE_ENGINEERING: "Software Engineering",
  FULL_STACK: "Full-Stack",
  AI_ML: "AI/ML",
  CYBERSECURITY: "Cybersecurity",
  EMBEDDED_SYSTEMS: "Embedded",
  IOT: "IoT",
  RESEARCH: "Research",
  HARDWARE: "Hardware",
  OTHER: "Other",
};

const STATUS_LABELS: Record<string, "In Development" | "Completed" | "Research" | "Paused" | "Archived"> = {
  IN_DEVELOPMENT: "In Development",
  COMPLETED: "Completed",
  RESEARCH: "Research",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

export type PublicProjectResult = { label: string; value: string };

export type PublicProject = {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  status: string;
  category: string[];
  featured: boolean;
  tech: string[];
  repoUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  paperUrl?: string;
  overview: string;
  role: string;
  problem: string;
  solution: string[];
  results: PublicProjectResult[];
  coverImageUrl: string | null;
  attachments: { label: string; description: string | null; url: string; mimeType: string }[];
};

type DbProject = Awaited<ReturnType<typeof fetchPublishedProjects>>[number];

function toPublicProject(p: DbProject): PublicProject {
  return {
    slug: p.slug,
    title: p.title,
    shortTitle: p.shortTitle || p.title,
    tagline: p.shortDescription,
    status: STATUS_LABELS[p.status] ?? p.status,
    category: p.categories.map((c) => CATEGORY_LABELS[c] ?? c),
    featured: p.featured,
    tech: p.technologies,
    repoUrl: p.githubUrl ?? undefined,
    demoUrl: p.demoUrl ?? undefined,
    docsUrl: p.docsUrl ?? undefined,
    paperUrl: p.paperUrl ?? undefined,
    overview: p.detailedDescription ?? p.shortDescription,
    role: p.role ?? "",
    problem: p.problem ?? "",
    solution: p.solution,
    results: Array.isArray(p.results) ? (p.results as unknown as PublicProjectResult[]) : [],
    coverImageUrl: p.coverImage?.url ?? null,
    attachments: p.attachments.map((a) => ({
      label: a.label,
      description: a.description,
      url: a.media.url,
      mimeType: a.media.mimeType,
    })),
  };
}

const projectInclude = {
  coverImage: true,
  attachments: {
    where: { visibility: "PUBLIC" as const },
    include: { media: true },
    orderBy: { displayOrder: "asc" as const },
  },
};

async function fetchPublishedProjects() {
  return prisma.project.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
    include: projectInclude,
  });
}

/**
 * The database isn't provisioned in every environment this code runs in yet
 * (e.g. a fresh Vercel deployment before DATABASE_URL is set) — a build must
 * still succeed and the site must still render *something* in that case,
 * rather than hard-crashing static generation. Every public data-fetch below
 * goes through this so a DB outage degrades to "no projects shown" instead
 * of a failed deploy. Once a real DATABASE_URL is connected this never
 * triggers on the happy path.
 */
async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[projects] database call failed, using fallback:", err);
    return fallback;
  }
}

// Tagged "projects" — admin mutations call revalidateTag("projects", "max")
// so edits show up immediately instead of waiting out the hour.
export const getPublishedProjects = unstable_cache(
  async (): Promise<PublicProject[]> =>
    safely([], async () => {
      const rows = await fetchPublishedProjects();
      return rows.map(toPublicProject);
    }),
  ["published-projects"],
  { tags: ["projects"], revalidate: 3600 }
);

export const getFeaturedProjects = unstable_cache(
  async (): Promise<PublicProject[]> =>
    safely([], async () => {
      const all = await getPublishedProjects();
      return all.filter((p) => p.featured);
    }),
  ["featured-projects"],
  { tags: ["projects"], revalidate: 3600 }
);

export const getPublishedProjectBySlug = unstable_cache(
  async (slug: string): Promise<PublicProject | null> =>
    safely(null, async () => {
      const row = await prisma.project.findFirst({
        where: { slug, published: true, deletedAt: null },
        include: projectInclude,
      });
      return row ? toPublicProject(row) : null;
    }),
  ["published-project-by-slug"],
  { tags: ["projects"], revalidate: 3600 }
);

export const getAllPublishedSlugs = unstable_cache(
  async (): Promise<string[]> =>
    safely([], async () => {
      const rows = await prisma.project.findMany({
        where: { published: true, deletedAt: null },
        select: { slug: true },
      });
      return rows.map((r) => r.slug);
    }),
  ["published-project-slugs"],
  { tags: ["projects"], revalidate: 3600 }
);
