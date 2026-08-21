import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ArrowUp, ArrowDown, Star, Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toggleAwardFeaturedAction, toggleAwardPublishedAction, moveAwardAction } from "./actions";

export const metadata: Metadata = { title: "Awards" };

export default async function AdminAwardsPage() {
  const items = await prisma.award.findMany({
    where: { deletedAt: null },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Awards</h1>
          <p className="mt-1 text-sm text-muted">{items.length} total</p>
        </div>
        <Link
          href="/admin/awards/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
        >
          <Plus size={15} /> New Award
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted">No awards yet — add your first one.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Year</th>
                <th className="px-5 py-3 font-medium">Visibility</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface/40">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <Link href={`/admin/awards/${a.id}`} className="font-medium hover:text-accent">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{a.year ?? "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <form action={toggleAwardPublishedAction.bind(null, a.id)}>
                        <button
                          type="submit"
                          className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                            a.published
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                              : "border-border text-muted hover:text-foreground"
                          }`}
                        >
                          {a.published ? <Eye size={12} /> : <EyeOff size={12} />}
                          {a.published ? "Published" : "Draft"}
                        </button>
                      </form>
                      <form action={toggleAwardFeaturedAction.bind(null, a.id)}>
                        <button
                          type="submit"
                          aria-label="Toggle featured"
                          className={a.featured ? "text-accent" : "text-muted hover:text-foreground"}
                        >
                          <Star size={14} fill={a.featured ? "currentColor" : "none"} />
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{a.updatedAt.toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <form action={moveAwardAction.bind(null, a.id, "up")}>
                        <button type="submit" aria-label="Move up" className="text-muted hover:text-foreground">
                          <ArrowUp size={14} />
                        </button>
                      </form>
                      <form action={moveAwardAction.bind(null, a.id, "down")}>
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
