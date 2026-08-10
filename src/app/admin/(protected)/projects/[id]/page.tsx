import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Trash2, Lock, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProjectForm, { type ProjectFormInitialValues } from "../ProjectForm";
import AttachmentUploadForm from "../AttachmentUploadForm";
import { softDeleteProjectAction, deleteAttachmentAction } from "../actions";

export const metadata: Metadata = { title: "Edit Project" };

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id, deletedAt: null },
    include: {
      coverImage: true,
      attachments: { include: { media: true }, orderBy: { displayOrder: "asc" } },
    },
  });

  if (!project) notFound();

  const initial: ProjectFormInitialValues = {
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    detailedDescription: project.detailedDescription ?? "",
    role: project.role ?? "",
    technologies: project.technologies.join(", "),
    githubUrl: project.githubUrl ?? "",
    demoUrl: project.demoUrl ?? "",
    docsUrl: project.docsUrl ?? "",
    paperUrl: project.paperUrl ?? "",
    startDate: toDateInput(project.startDate),
    endDate: toDateInput(project.endDate),
    status: project.status,
    categories: project.categories,
    featured: project.featured,
    published: project.published,
    coverImageUrl: project.coverImage?.url ?? null,
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} /> Back to projects
        </Link>
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{project.title}</h1>

      <div className="mt-6">
        <ProjectForm projectId={project.id} initial={initial} submitLabel="Save Changes" />
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold">Attachments</h2>
        <p className="mt-1 text-xs text-muted">
          PDFs, images, reports — shown as &quot;Documents &amp; Resources&quot; on the public project page when Public.
        </p>

        <div className="mt-4 space-y-2">
          {project.attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
            >
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
                <a
                  href={a.media.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  View
                </a>
                <form action={deleteAttachmentAction.bind(null, a.id, project.id)}>
                  <button type="submit" aria-label="Delete attachment" className="text-muted hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <AttachmentUploadForm projectId={project.id} />
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-400">Danger Zone</p>
        <p className="mt-1 text-xs text-muted">
          Removes this project from the public site and admin list. It stays in the database and can be restored by
          an admin directly if needed.
        </p>
        <form action={softDeleteProjectAction.bind(null, project.id)} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10"
          >
            Delete Project
          </button>
        </form>
      </div>
    </div>
  );
}
