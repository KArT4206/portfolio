import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EducationForm from "../EducationForm";

export const metadata: Metadata = { title: "New Education" };

export default function NewEducationPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/education" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to education
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">New Education</h1>

      <div className="mt-6">
        <EducationForm educationId={null} submitLabel="Create Education" />
      </div>
    </div>
  );
}
