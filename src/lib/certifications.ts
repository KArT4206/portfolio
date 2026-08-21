import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicCertification = {
  id: string;
  name: string;
  issuer: string;
  credentialId: string | null;
  description: string;
  issueDate: string | null;
  expiresDate: string | null; // null = does not expire
  // Uploaded file takes priority over an external credential URL; only set
  // when a real certificate/credential link actually exists.
  certificateUrl: string | null;
};

type DbCertification = Awaited<ReturnType<typeof fetchPublishedCertifications>>[number];

function toPublicCertification(c: DbCertification): PublicCertification {
  return {
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    credentialId: c.credentialId,
    description: c.description ?? "",
    issueDate: c.issueDate ? c.issueDate.toISOString() : null,
    expiresDate: c.expiresDate ? c.expiresDate.toISOString() : null,
    certificateUrl: c.certificateMedia?.url ?? c.credentialUrl ?? null,
  };
}

async function fetchPublishedCertifications() {
  return prisma.certification.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
    include: { certificateMedia: true },
  });
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[certifications] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getPublishedCertifications = unstable_cache(
  async (): Promise<PublicCertification[]> =>
    safely([], async () => {
      const rows = await fetchPublishedCertifications();
      return rows.map(toPublicCertification);
    }),
  ["published-certifications"],
  { tags: ["certifications"], revalidate: 3600 }
);
