import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicAward = {
  id: string;
  title: string;
  organization: string | null;
  detail: string;
  year: number | null;
  featured: boolean;
  // Only ever set when a real certificate (uploaded file or external URL)
  // exists — the public site must never render a certificate action
  // otherwise. Uploaded file takes priority over an external URL.
  certificateUrl: string | null;
};

type DbAward = Awaited<ReturnType<typeof fetchPublishedAwards>>[number];

function toPublicAward(a: DbAward): PublicAward {
  return {
    id: a.id,
    title: a.title,
    organization: a.organization,
    detail: a.detail ?? "",
    year: a.year,
    featured: a.featured,
    certificateUrl: a.certificateMedia?.url ?? a.certificateUrl ?? null,
  };
}

async function fetchPublishedAwards() {
  return prisma.award.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
    include: { certificateMedia: true },
  });
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[awards] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getPublishedAwards = unstable_cache(
  async (): Promise<PublicAward[]> =>
    safely([], async () => {
      const rows = await fetchPublishedAwards();
      return rows.map(toPublicAward);
    }),
  ["published-awards"],
  { tags: ["awards"], revalidate: 3600 }
);
