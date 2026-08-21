import { NextResponse } from "next/server";
import { fetchGithubRepos } from "@/lib/github";
import { getGithubPresentation } from "@/lib/githubPresentation";

/**
 * Public, cached view of this site's GitHub repos. The homepage's server
 * components call fetchGithubRepos() directly (no need to hop through this
 * route on the server), but this endpoint exists so the raw feed is
 * independently inspectable/consumable — and so revalidateTag("github-repos")
 * in the webhook route has something externally visible to invalidate.
 */
export async function GET() {
  const [{ repos, stale, error }, presentation] = await Promise.all([fetchGithubRepos(), getGithubPresentation()]);
  const visible = repos.filter((r) => !presentation.hiddenRepositories.includes(r.name));

  return NextResponse.json(
    { repos: visible, stale, error: error ?? null, count: visible.length },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
