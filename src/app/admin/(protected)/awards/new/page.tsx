import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AwardForm from "../AwardForm";

export const metadata: Metadata = { title: "New Award" };

export default function NewAwardPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/awards" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to awards
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">New Award</h1>

      <div className="mt-6">
        <AwardForm awardId={null} submitLabel="Create Award" />
      </div>
    </div>
  );
}
