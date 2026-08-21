import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicEducation = {
  id: string;
  school: string;
  degree: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null; // null = ongoing / expected
  coursework: string[];
};

type DbEducation = Awaited<ReturnType<typeof fetchPublishedEducation>>[number];

function toPublicEducation(e: DbEducation): PublicEducation {
  return {
    id: e.id,
    school: e.school,
    degree: e.degree,
    location: e.location,
    startDate: e.startDate ? e.startDate.toISOString() : null,
    endDate: e.endDate ? e.endDate.toISOString() : null,
    coursework: e.coursework,
  };
}

async function fetchPublishedEducation() {
  return prisma.education.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
  });
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[education] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getPublishedEducation = unstable_cache(
  async (): Promise<PublicEducation[]> =>
    safely([], async () => {
      const rows = await fetchPublishedEducation();
      return rows.map(toPublicEducation);
    }),
  ["published-education"],
  { tags: ["education"], revalidate: 3600 }
);
