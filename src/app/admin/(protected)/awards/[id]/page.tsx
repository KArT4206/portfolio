import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AwardForm, { type AwardFormInitialValues } from "../AwardForm";
import { softDeleteAwardAction, removeAwardCertificateAction } from "../actions";

export const metadata: Metadata = { title: "Edit Award" };

export default async function EditAwardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.award.findUnique({
    where: { id, deletedAt: null },
    include: { certificateMedia: true },
  });

  if (!item) notFound();

  const initial: AwardFormInitialValues = {
    title: item.title,
    organization: item.organization ?? "",
    detail: item.detail ?? "",
    year: item.year?.toString() ?? "",
    certificateUrl: item.certificateUrl ?? "",
    featured: item.featured,
    published: item.published,
    certificateFileUrl: item.certificateMedia?.url ?? null,
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/awards" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to awards
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{item.title}</h1>

      {item.certificateMedia && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-sm">
            Uploaded certificate: <span className="text-muted">{item.certificateMedia.originalName}</span>
          </p>
          <form action={removeAwardCertificateAction.bind(null, item.id)}>
            <button type="submit" aria-label="Remove certificate" className="text-muted hover:text-red-400">
              <X size={14} />
            </button>
          </form>
        </div>
      )}

      <div className="mt-6">
        <AwardForm awardId={item.id} initial={initial} submitLabel="Save Changes" />
      </div>

      <div className="mt-12 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-400">Danger Zone</p>
        <p className="mt-1 text-xs text-muted">
          Removes this award from the public site and admin list. It stays in the database and can be restored directly if needed.
        </p>
        <form action={softDeleteAwardAction.bind(null, item.id)} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10"
          >
            Delete Award
          </button>
        </form>
      </div>
    </div>
  );
}
