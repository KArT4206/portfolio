import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Star, EyeOff, Eye } from "lucide-react";
import { fetchGithubRepos } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import { toggleOverrideFeaturedAction, toggleOverrideHiddenAction } from "./actions";

export const metadata: Metadata = { title: "GitHub" };

export default async function AdminGithubPage() {
  const [{ repos, stale, error }, overrides] = await Promise.all([
    fetchGithubRepos(),
    prisma.githubRepoOverride.findMany(),
  ]);

  const overrideByName = new Map(overrides.map((o) => [o.repoName, o]));

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">GitHub</h1>
      <p className="mt-1 text-sm text-muted">
        Live-synced from github.com/KArT4206 — {repos.length} repositories. GitHub stays the source of truth for
        repo data; this only controls how each one is presented.
      </p>

      {stale && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle size={15} /> Showing cached data — live GitHub API request failed{error ? ` (${error})` : ""}.
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Repository</th>
              <th className="px-5 py-3 font-medium">Alias</th>
              <th className="px-5 py-3 font-medium">Visibility</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface/40">
            {repos.map((r) => {
              const override = overrideByName.get(r.name);
              return (
                <tr key={r.id} className="hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <Link href={`/admin/github/${encodeURIComponent(r.name)}`} className="font-medium hover:text-accent">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{override?.alias || "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <form action={toggleOverrideHiddenAction.bind(null, r.name)}>
                        <button
                          type="submit"
                          className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                            override?.hidden
                              ? "border-red-400/30 bg-red-400/10 text-red-400"
                              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                          }`}
                        >
                          {override?.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                          {override?.hidden ? "Hidden" : "Visible"}
                        </button>
                      </form>
                      <form action={toggleOverrideFeaturedAction.bind(null, r.name)}>
                        <button
                          type="submit"
                          aria-label="Toggle featured"
                          className={override?.featured ? "text-accent" : "text-muted hover:text-foreground"}
                        >
                          <Star size={14} fill={override?.featured ? "currentColor" : "none"} />
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/github/${encodeURIComponent(r.name)}`}
                      className="text-xs text-accent hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
