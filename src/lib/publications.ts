import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicPublication = {
  id: string;
  title: string;
  authors: string[];
  journal: string | null;
  publicationDate: string | null;
  doi: string | null;
  url: string | null;
  status: string;
  abstract: string;
  keywords: string[];
  featured: boolean;
  attachments: { label: string; description: string | null; url: string; mimeType: string }[];
};

type DbPublication = Awaited<ReturnType<typeof fetchPublishedPublications>>[number];

function toPublicPublication(p: DbPublication): PublicPublication {
  return {
    id: p.id,
    title: p.title,
    authors: p.authors,
    journal: p.journal,
    publicationDate: p.publicationDate ? p.publicationDate.toISOString() : null,
    doi: p.doi,
    url: p.url,
    status: p.status,
    abstract: p.abstract ?? "",
    keywords: p.keywords,
    featured: p.featured,
    attachments: p.attachments
      .filter((a) => a.visibility === "PUBLIC")
      .map((a) => ({ label: a.label, description: a.description, url: a.media.url, mimeType: a.media.mimeType })),
  };
}

async function fetchPublishedPublications() {
  return prisma.publication.findMany({
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

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[publications] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getPublishedPublications = unstable_cache(
  async (): Promise<PublicPublication[]> =>
    safely([], async () => {
      const rows = await fetchPublishedPublications();
      return rows.map(toPublicPublication);
    }),
  ["published-publications"],
  { tags: ["publications"], revalidate: 3600 }
);
