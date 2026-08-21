import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import OverrideForm, { type OverrideFormInitialValues } from "../OverrideForm";

export const metadata: Metadata = { title: "Edit Repository Presentation" };

export default async function EditGithubOverridePage({ params }: { params: Promise<{ repoName: string }> }) {
  const { repoName: encoded } = await params;
  const repoName = decodeURIComponent(encoded);

  const override = await prisma.githubRepoOverride.findUnique({ where: { repoName } });

  const initial: OverrideFormInitialValues = {
    alias: override?.alias ?? "",
    categories: override?.categories.join(", ") ?? "",
    displayOrder: override?.displayOrder?.toString() ?? "",
    caseStudySlug: override?.caseStudySlug ?? "",
    featured: override?.featured ?? false,
    hidden: override?.hidden ?? false,
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <Link href="/admin/github" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to GitHub
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{repoName}</h1>
      <p className="mt-1 text-xs text-muted">
        Presentation only — the repo&apos;s real data (stars, description, language, ...) always comes live from
        GitHub.
      </p>

      <div className="mt-6">
        <OverrideForm repoName={repoName} initial={initial} />
      </div>
    </div>
  );
}
