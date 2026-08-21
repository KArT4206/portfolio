import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Trash2, Lock, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ResearchForm, { type ResearchFormInitialValues } from "../ResearchForm";
import AttachmentUploadForm from "../AttachmentUploadForm";
import { softDeleteResearchAction, deleteResearchAttachmentAction } from "../actions";
import type { MetricRow } from "@/lib/validation/research";

export const metadata: Metadata = { title: "Edit Research" };

export default async function EditResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.research.findUnique({
    where: { id, deletedAt: null },
    include: { attachments: { include: { media: true }, orderBy: { displayOrder: "asc" } } },
  });

  if (!item) notFound();

  const initial: ResearchFormInitialValues = {
    title: item.title,
    description: item.description ?? "",
    authors: item.authors.join(", "),
    conference: item.conference ?? "",
    status: item.status,
    year: item.year?.toString() ?? "",
    doi: item.doi ?? "",
    paperUrl: item.paperUrl ?? "",
    featured: item.featured,
    published: item.published,
    metrics: Array.isArray(item.metrics) ? (item.metrics as unknown as MetricRow[]) : [],
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/research" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to research
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{item.title}</h1>

      <div className="mt-6">
        <ResearchForm researchId={item.id} initial={initial} submitLabel="Save Changes" />
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold">Attachments</h2>
        <p className="mt-1 text-xs text-muted">
          Papers, certificates, supplementary files — shown as documents on the public site when Public.
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
                <form action={deleteResearchAttachmentAction.bind(null, a.id, item.id)}>
                  <button type="submit" aria-label="Delete attachment" className="text-muted hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <AttachmentUploadForm researchId={item.id} />
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-400">Danger Zone</p>
        <p className="mt-1 text-xs text-muted">
          Removes this entry from the public site and admin list. It stays in the database and can be restored directly if needed.
        </p>
        <form action={softDeleteResearchAction.bind(null, item.id)} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10"
          >
            Delete Research
          </button>
        </form>
      </div>
    </div>
  );
}
