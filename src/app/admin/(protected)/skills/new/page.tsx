import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SkillGroupForm from "../SkillGroupForm";

export const metadata: Metadata = { title: "New Skill Category" };

export default function NewSkillGroupPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/skills" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to skills
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">New Skill Category</h1>

      <div className="mt-6">
        <SkillGroupForm skillGroupId={null} submitLabel="Create Category" />
      </div>
    </div>
  );
}
