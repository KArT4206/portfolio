import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toggleSkillGroupPublishedAction, moveSkillGroupAction } from "./actions";

export const metadata: Metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const items = await prisma.skillGroup.findMany({
    where: { deletedAt: null },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Skills</h1>
          <p className="mt-1 text-sm text-muted">{items.length} categories</p>
        </div>
        <Link
          href="/admin/skills/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
        >
          <Plus size={15} /> New Category
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted">No skill categories yet — add your first one.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Visibility</th>
                <th className="px-5 py-3 font-medium">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface/40">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <Link href={`/admin/skills/${s.id}`} className="font-medium hover:text-accent">
                      {s.category}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{s.items.length} items</td>
                  <td className="px-5 py-3">
                    <form action={toggleSkillGroupPublishedAction.bind(null, s.id)}>
                      <button
                        type="submit"
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                          s.published
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                            : "border-border text-muted hover:text-foreground"
                        }`}
                      >
                        {s.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {s.published ? "Published" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <form action={moveSkillGroupAction.bind(null, s.id, "up")}>
                        <button type="submit" aria-label="Move up" className="text-muted hover:text-foreground">
                          <ArrowUp size={14} />
                        </button>
                      </form>
                      <form action={moveSkillGroupAction.bind(null, s.id, "down")}>
                        <button type="submit" aria-label="Move down" className="text-muted hover:text-foreground">
                          <ArrowDown size={14} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
