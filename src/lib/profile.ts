import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { profile as staticProfileFallback } from "@/lib/data";

export type PublicProfile = {
  name: string;
  initials: string;
  tagline: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  summary: string;
  heroLines: string[];
  imageUrl: string | null;
};

// If the DB is unreachable or the singleton row hasn't been created yet,
// fall back to the same real, hand-verified data this whole CMS migrated
// away from — never a placeholder.
const FALLBACK: PublicProfile = {
  name: staticProfileFallback.name,
  initials: staticProfileFallback.initials,
  tagline: staticProfileFallback.tagline,
  location: staticProfileFallback.location,
  email: staticProfileFallback.email,
  githubUrl: staticProfileFallback.links.github,
  linkedinUrl: staticProfileFallback.links.linkedin,
  summary: staticProfileFallback.summary,
  heroLines: staticProfileFallback.heroLines,
  imageUrl: null,
};

async function fetchProfile(): Promise<PublicProfile> {
  const row = await prisma.profile.findUnique({ where: { id: "singleton" }, include: { profileImage: true } });
  if (!row) return FALLBACK;
  return {
    name: row.name,
    initials: row.initials,
    tagline: row.tagline,
    location: row.location,
    email: row.email,
    githubUrl: row.githubUrl,
    linkedinUrl: row.linkedinUrl,
    summary: row.summary,
    heroLines: row.heroLines,
    imageUrl: row.profileImage?.url ?? null,
  };
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[profile] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getProfile = unstable_cache(
  async (): Promise<PublicProfile> => safely(FALLBACK, fetchProfile),
  ["public-profile"],
  { tags: ["profile"], revalidate: 3600 }
);
