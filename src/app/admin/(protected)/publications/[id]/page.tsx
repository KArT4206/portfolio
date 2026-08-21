import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Trash2, Lock, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PublicationForm, { type PublicationFormInitialValues } from "../PublicationForm";
import AttachmentUploadForm from "../AttachmentUploadForm";
import { softDeletePublicationAction, deletePublicationAttachmentAction } from "../actions";

export const metadata: Metadata = { title: "Edit Publication" };

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditPublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.publication.findUnique({
    where: { id, deletedAt: null },
    include: { attachments: { include: { media: true }, orderBy: { displayOrder: "asc" } } },
  });

  if (!item) notFound();

  const initial: PublicationFormInitialValues = {
    title: item.title,
    authors: item.authors.join(", "),
    journal: item.journal ?? "",
    publicationDate: toDateInput(item.publicationDate),
    doi: item.doi ?? "",
    url: item.url ?? "",
    status: item.status,
    abstract: item.abstract ?? "",
    keywords: item.keywords.join(", "),
    featured: item.featured,
    published: item.published,
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/publications" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to publications
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{item.title}</h1>

      <div className="mt-6">
        <PublicationForm publicationId={item.id} initial={initial} submitLabel="Save Changes" />
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold">Attachments</h2>
        <p className="mt-1 text-xs text-muted">
          Preprints, camera-ready PDFs, supplementary files — shown as documents on the public site when Public.
        </p>

        <div className="mt-4 space-y-2">
          {item.attachments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-accent" />
                <div>
                  <p className="text-sm">{a.label}</p>
                  <p className="text-xs text-muted">
                    {a.media.originalName} · {(a.media.size / 1024).toFixed(0)}KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted">
                  {a.visibility === "PUBLIC" ? <Globe size={12} /> : <Lock size={12} />}
                  {a.visibility === "PUBLIC" ? "Public" : "Private"}
                </span>
                <a href={a.media.url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                  View
                </a>
                <form action={deletePublicationAttachmentAction.bind(null, a.id, item.id)}>
                  <button type="submit" aria-label="Delete attachment" className="text-muted hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <AttachmentUploadForm publicationId={item.id} />
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-400">Danger Zone</p>
        <p className="mt-1 text-xs text-muted">
          Removes this publication from the public site and admin list. It stays in the database and can be restored directly if needed.
        </p>
        <form action={softDeletePublicationAction.bind(null, item.id)} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10"
          >
            Delete Publication
          </button>
        </form>
      </div>
    </div>
  );
}
