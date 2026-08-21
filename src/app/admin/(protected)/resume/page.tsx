import type { Metadata } from "next";
import { CheckCircle2, FileText, Link as LinkIcon, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ResumeUploadForm from "./ResumeUploadForm";
import { setActiveResumeAction, softDeleteResumeAction } from "./actions";

export const metadata: Metadata = { title: "Resume" };

export default async function AdminResumePage() {
  const resumes = await prisma.resume.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { media: true },
  });

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Resume</h1>
      <p className="mt-1 text-sm text-muted">
        The public &quot;Download Resume&quot; button always points to whichever version is marked Active.
      </p>

      <div className="mt-6">
        <ResumeUploadForm />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {resumes.map((r) => {
          const url = r.media?.url ?? r.externalUrl ?? "";
          return (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4">
              <div className="flex items-center gap-3">
                {r.media ? <FileText size={16} className="text-accent" /> : <LinkIcon size={16} className="text-accent" />}
                <div>
                  <p className="text-sm">{r.label || (r.media ? r.media.originalName : "External link")}</p>
                  <a href={url} target="_blank" rel="noreferrer" className="text-xs text-muted hover:text-accent hover:underline">
                    {url}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {r.isActive ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 size={13} /> Active
                  </span>
                ) : (
                  <form action={setActiveResumeAction.bind(null, r.id)}>
                    <button type="submit" className="rounded-full border border-border-dim px-3 py-1 text-xs hover:border-accent hover:text-accent">
                      Set Active
                    </button>
                  </form>
                )}
                <form action={softDeleteResumeAction.bind(null, r.id)}>
                  <button type="submit" aria-label="Delete resume" className="text-muted hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          );
        })}
        {resumes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            No resume versions yet — add one above.
          </div>
        )}
      </div>
    </div>
  );
}
