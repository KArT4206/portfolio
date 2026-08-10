import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Audit Log" };

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { actor: { select: { username: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Audit Log</h1>
      <p className="mt-1 text-sm text-muted">{total} recorded actions.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Actor</th>
              <th className="px-5 py-3 font-medium">Resource</th>
              <th className="px-5 py-3 font-medium">IP</th>
              <th className="px-5 py-3 font-medium">Result</th>
              <th className="px-5 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface/40">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-5 py-3 font-mono text-xs">{e.action}</td>
                <td className="px-5 py-3 text-muted">{e.actor?.username ?? "—"}</td>
                <td className="px-5 py-3 text-muted">
                  {e.resourceType ? `${e.resourceType}${e.resourceId ? ` · ${e.resourceId.slice(0, 8)}…` : ""}` : "—"}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-muted">{e.ip ?? "—"}</td>
                <td className="px-5 py-3">
                  {e.result === "SUCCESS" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 size={13} /> Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-400">
                      <XCircle size={13} /> Failure
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-muted">{e.createdAt.toLocaleString()}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/audit?page=${p}`}
              className={`rounded-md px-2.5 py-1 ${p === page ? "bg-accent-soft text-accent" : "hover:bg-surface-2"}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
