import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicSkillGroup = {
  id: string;
  category: string;
  items: string[];
};

type DbSkillGroup = Awaited<ReturnType<typeof fetchPublishedSkillGroups>>[number];

function toPublicSkillGroup(s: DbSkillGroup): PublicSkillGroup {
  return { id: s.id, category: s.category, items: s.items };
}

async function fetchPublishedSkillGroups() {
  return prisma.skillGroup.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
  });
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[skillGroups] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getPublishedSkillGroups = unstable_cache(
  async (): Promise<PublicSkillGroup[]> =>
    safely([], async () => {
      const rows = await fetchPublishedSkillGroups();
      return rows.map(toPublicSkillGroup);
    }),
  ["published-skill-groups"],
  { tags: ["skills"], revalidate: 3600 }
);
