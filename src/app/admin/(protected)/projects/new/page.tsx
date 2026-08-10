import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProjectForm from "../ProjectForm";

export const metadata: Metadata = { title: "New Project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to projects
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">New Project</h1>

      <div className="mt-6">
        <ProjectForm projectId={null} submitLabel="Create Project" />
      </div>
    </div>
  );
}
