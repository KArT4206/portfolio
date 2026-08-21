import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import SkillGroupForm, { type SkillGroupFormInitialValues } from "../SkillGroupForm";
import { softDeleteSkillGroupAction } from "../actions";

export const metadata: Metadata = { title: "Edit Skill Category" };

export default async function EditSkillGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.skillGroup.findUnique({ where: { id, deletedAt: null } });
  if (!item) notFound();

  const initial: SkillGroupFormInitialValues = {
    category: item.category,
    items: item.items.join(", "),
    published: item.published,
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/skills" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to skills
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{item.category}</h1>

      <div className="mt-6">
        <SkillGroupForm skillGroupId={item.id} initial={initial} submitLabel="Save Changes" />
      </div>

      <div className="mt-12 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-400">Danger Zone</p>
        <p className="mt-1 text-xs text-muted">
          Removes this category from the public site and admin list. It stays in the database and can be restored directly if needed.
        </p>
        <form action={softDeleteSkillGroupAction.bind(null, item.id)} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10"
          >
            Delete Category
          </button>
        </form>
      </div>
    </div>
  );
}
