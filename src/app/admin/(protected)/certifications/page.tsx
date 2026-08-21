import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toggleCertificationPublishedAction, moveCertificationAction } from "./actions";

export const metadata: Metadata = { title: "Certifications" };

export default async function AdminCertificationsPage() {
  const items = await prisma.certification.findMany({
    where: { deletedAt: null },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Certifications</h1>
          <p className="mt-1 text-sm text-muted">{items.length} total</p>
        </div>
        <Link
          href="/admin/certifications/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
        >
          <Plus size={15} /> New Certification
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted">No certifications yet — add your first one.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Issuer</th>
                <th className="px-5 py-3 font-medium">Visibility</th>
                <th className="px-5 py-3 font-medium">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface/40">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <Link href={`/admin/certifications/${c.id}`} className="font-medium hover:text-accent">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{c.issuer}</td>
                  <td className="px-5 py-3">
                    <form action={toggleCertificationPublishedAction.bind(null, c.id)}>
                      <button
                        type="submit"
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                          c.published
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                            : "border-border text-muted hover:text-foreground"
                        }`}
                      >
                        {c.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {c.published ? "Published" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <form action={moveCertificationAction.bind(null, c.id, "up")}>
                        <button type="submit" aria-label="Move up" className="text-muted hover:text-foreground">
                          <ArrowUp size={14} />
                        </button>
                      </form>
                      <form action={moveCertificationAction.bind(null, c.id, "down")}>
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
