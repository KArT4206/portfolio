import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import MessageStatusSelect from "./MessageStatusSelect";

export const metadata: Metadata = { title: "Contact Messages" };

const PAGE_SIZE = 30;

const STATUS_STYLES: Record<string, string> = {
  NEW: "text-accent",
  READ: "text-muted",
  REPLIED: "text-emerald-400",
  ARCHIVED: "text-muted/60",
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [messages, total, newCount] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Contact Messages</h1>
      <p className="mt-1 text-sm text-muted">
        {total} received{newCount > 0 ? ` · ${newCount} new` : ""}.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {m.name} <span className="font-normal text-muted">&lt;{m.email}&gt;</span>
                </p>
                {m.subject && <p className="mt-0.5 text-sm text-muted">{m.subject}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium uppercase tracking-wide ${STATUS_STYLES[m.status]}`}>
                  {m.status}
                </span>
                <MessageStatusSelect id={m.id} status={m.status} />
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{m.message}</p>
            <p className="mt-3 text-xs text-muted/60">{m.createdAt.toLocaleString()}</p>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            No messages yet — submissions from the public contact form will show up here.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/messages?page=${p}`}
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
