import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicResume = { url: string; label: string | null };

async function fetchActiveResume(): Promise<PublicResume | null> {
  const row = await prisma.resume.findFirst({
    where: { isActive: true, deletedAt: null },
    include: { media: true },
  });
  if (!row) return null;
  const url = row.media?.url ?? row.externalUrl;
  if (!url) return null;
  return { url, label: row.label };
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[resume] database call failed, using fallback:", err);
    return fallback;
  }
}

// Falls back to null (never a broken/fake link) when no active resume has
// been configured yet — the caller decides what to do (e.g. keep the
// static placeholder file, or hide the download button).
export const getActiveResume = unstable_cache(
  async (): Promise<PublicResume | null> => safely(null, fetchActiveResume),
  ["active-resume"],
  { tags: ["resume"], revalidate: 3600 }
);
