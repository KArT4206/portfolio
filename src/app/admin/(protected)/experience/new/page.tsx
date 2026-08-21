import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExperienceForm from "../ExperienceForm";

export const metadata: Metadata = { title: "New Experience" };

export default function NewExperiencePage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/experience" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to experience
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">New Experience</h1>

      <div className="mt-6">
        <ExperienceForm experienceId={null} submitLabel="Create Experience" />
      </div>
    </div>
  );
}
