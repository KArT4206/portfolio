import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Star, ImageIcon, Clock, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  const [totalProjects, featuredProjects, mediaFiles, recentProjects] = await Promise.all([
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.project.count({ where: { deletedAt: null, featured: true } }),
    prisma.media.count(),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, slug: true, title: true, published: true, updatedAt: true },
    }),
  ]);

  return {
    totalProjects,
    featuredProjects,
    mediaFiles,
    recentProjects,
    lastUpdate: recentProjects[0]?.updatedAt ?? null,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Projects", value: stats.totalProjects, icon: FolderKanban },
    { label: "Featured Projects", value: stats.featuredProjects, icon: Star },
    { label: "Uploaded Files", value: stats.mediaFiles, icon: ImageIcon },
    {
      label: "Last Content Update",
      value: stats.lastUpdate ? stats.lastUpdate.toLocaleDateString() : "—",
      icon: Clock,
    },
  ];

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Overview of your portfolio content.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-surface p-5">
            <card.icon size={18} className="text-accent" />
            <p className="mt-3 font-display text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-xs text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      {stats.totalProjects === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">
            No projects yet.{" "}
            <Link href="/admin/projects" className="text-accent hover:underline">
              Add your first one
            </Link>
            , or run <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">npm run db:seed:projects</code> to
            migrate your existing hand-authored case studies.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">Recently Updated</h2>
            <Link href="/admin/projects" className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {stats.recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-surface-2"
              >
                <span>{p.title}</span>
                <span className="flex items-center gap-3 text-xs text-muted">
                  {p.published ? (
                    <span className="text-emerald-400">Published</span>
                  ) : (
                    <span>Draft</span>
                  )}
                  {p.updatedAt.toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
