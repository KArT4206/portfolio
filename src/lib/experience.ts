import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicExperience = {
  id: string;
  org: string;
  role: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null; // null = present
  bullets: string[];
};

type DbExperience = Awaited<ReturnType<typeof fetchPublishedExperience>>[number];

function toPublicExperience(e: DbExperience): PublicExperience {
  return {
    id: e.id,
    org: e.org,
    role: e.role,
    location: e.location,
    startDate: e.startDate ? e.startDate.toISOString() : null,
    endDate: e.endDate ? e.endDate.toISOString() : null,
    bullets: e.bullets,
  };
}

async function fetchPublishedExperience() {
  return prisma.experience.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
  });
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[experience] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getPublishedExperience = unstable_cache(
  async (): Promise<PublicExperience[]> =>
    safely([], async () => {
      const rows = await fetchPublishedExperience();
      return rows.map(toPublicExperience);
    }),
  ["published-experience"],
  { tags: ["experience"], revalidate: 3600 }
);
