import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import MediaUploadForm from "./MediaUploadForm";
import MediaCard from "./MediaCard";

export const metadata: Metadata = { title: "Media" };

type SortKey = "newest" | "oldest" | "largest" | "name";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; sort?: string }>;
}) {
  const { q, type, sort } = await searchParams;
  const sortKey = (sort as SortKey) || "newest";

  const orderBy =
    sortKey === "oldest"
      ? { createdAt: "asc" as const }
      : sortKey === "largest"
        ? { size: "desc" as const }
        : sortKey === "name"
          ? { originalName: "asc" as const }
          : { createdAt: "desc" as const };

  const items = await prisma.media.findMany({
    where: {
      ...(q ? { originalName: { contains: q, mode: "insensitive" } } : {}),
      ...(type ? { mimeType: { startsWith: type } } : {}),
    },
    orderBy,
    include: {
      _count: {
        select: {
          projectAttachments: true,
          projectCoverOf: true,
          researchAttachments: true,
          awardCertificateOf: true,
          certificationCertOf: true,
          publicationAttachments: true,
          resumeOf: true,
        },
      },
    },
  });

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Media</h1>
      <p className="mt-1 text-sm text-muted">{items.length} files across the whole CMS.</p>

      <div className="mt-6">
        <MediaUploadForm />
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by filename..."
          className="w-full max-w-xs rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-accent/50"
        />
        <select name="type" defaultValue={type ?? ""} className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none">
          <option value="">All types</option>
          <option value="image/">Images</option>
          <option value="application/pdf">PDFs</option>
        </select>
        <select name="sort" defaultValue={sortKey} className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="largest">Largest</option>
          <option value="name">Name</option>
        </select>
        <button type="submit" className="rounded-full border border-border px-4 py-2 text-sm hover:border-accent">
          Apply
        </button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => {
          const usage =
            m._count.projectAttachments +
            m._count.projectCoverOf +
            m._count.researchAttachments +
            m._count.awardCertificateOf +
            m._count.certificationCertOf +
            m._count.publicationAttachments +
            m._count.resumeOf;
          return (
            <MediaCard
              key={m.id}
              id={m.id}
              originalName={m.originalName}
              url={m.url}
              mimeType={m.mimeType}
              size={m.size}
              createdAt={m.createdAt.toISOString()}
              usage={usage}
            />
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted">
            No media files match.
          </div>
        )}
      </div>
    </div>
  );
}
