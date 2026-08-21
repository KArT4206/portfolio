import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicResearchMetric = { label: string; value: string };

export type PublicResearch = {
  id: string;
  title: string;
  description: string;
  authors: string[];
  conference: string | null;
  status: string;
  year: number | null;
  doi: string | null;
  paperUrl: string | null;
  metrics: PublicResearchMetric[];
  featured: boolean;
  attachments: { label: string; description: string | null; url: string; mimeType: string }[];
};

type DbResearch = Awaited<ReturnType<typeof fetchPublishedResearch>>[number];

function toPublicResearch(r: DbResearch): PublicResearch {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    authors: r.authors,
    conference: r.conference,
    status: r.status,
    year: r.year,
    doi: r.doi,
    paperUrl: r.paperUrl,
    metrics: Array.isArray(r.metrics) ? (r.metrics as unknown as PublicResearchMetric[]) : [],
    featured: r.featured,
    attachments: r.attachments
      .filter((a) => a.visibility === "PUBLIC")
      .map((a) => ({ label: a.label, description: a.description, url: a.media.url, mimeType: a.media.mimeType })),
  };
}

async function fetchPublishedResearch() {
  return prisma.research.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
    include: {
      attachments: {
        where: { visibility: "PUBLIC" as const },
        include: { media: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });
}

/**
 * Same DB-outage-safe fallback pattern as src/lib/projects.ts — a missing
 * DATABASE_URL or unreachable DB degrades to an empty list instead of
 * crashing the build.
 */
async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[research] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getPublishedResearch = unstable_cache(
  async (): Promise<PublicResearch[]> =>
    safely([], async () => {
      const rows = await fetchPublishedResearch();
      return rows.map(toPublicResearch);
    }),
  ["published-research"],
  { tags: ["research"], revalidate: 3600 }
);
