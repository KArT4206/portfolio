import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ResearchForm from "../ResearchForm";

export const metadata: Metadata = { title: "New Research" };

export default function NewResearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/research" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to research
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">New Research</h1>

      <div className="mt-6">
        <ResearchForm researchId={null} submitLabel="Create Research" />
      </div>
    </div>
  );
}
