import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PublicationForm from "../PublicationForm";

export const metadata: Metadata = { title: "New Publication" };

export default function NewPublicationPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/publications" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to publications
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">New Publication</h1>

      <div className="mt-6">
        <PublicationForm publicationId={null} submitLabel="Create Publication" />
      </div>
    </div>
  );
}
