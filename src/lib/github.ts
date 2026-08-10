import "server-only";

const GITHUB_USERNAME = "KArT4206";
const REVALIDATE_SECONDS = 3600; // 1 hour — happy-path freshness window
const REPOS_TAG = "github-repos";

export type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  license: string | null;
  visibility: string;
  archived: boolean;
  fork: boolean;
  size: number;
};

// Only the fields we actually read — the real GitHub response has ~80 fields per repo.
type GithubApiRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  license: { spdx_id: string | null; name: string } | null;
  visibility: string;
  archived: boolean;
  fork: boolean;
  size: number;
};

function normalizeRepo(raw: GithubApiRepo): GithubRepo {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description,
    htmlUrl: raw.html_url,
    homepage: raw.homepage && raw.homepage.trim() ? raw.homepage : null,
    language: raw.language,
    topics: raw.topics ?? [],
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    openIssues: raw.open_issues_count,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
    defaultBranch: raw.default_branch,
    license: raw.license?.spdx_id && raw.license.spdx_id !== "NOASSERTION" ? raw.license.spdx_id : raw.license?.name ?? null,
    visibility: raw.visibility,
    archived: raw.archived,
    fork: raw.fork,
    size: raw.size,
  };
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // Unauthenticated is the default (60 req/hr/IP is plenty given hour-long server-side
  // caching below). Set GITHUB_TOKEN only if you need the 5000 req/hr authenticated
  // limit — e.g. many featured repos with README excerpts, or private-repo access.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

// In-memory last-known-good fallback. This is a *secondary* safety net on top of
// Next.js's own fetch Data Cache — it only helps within a warm server instance
// (resets on cold start), but costs nothing and covers the case where a
// revalidation fetch fails after the Data Cache entry has expired.
let lastGoodRepos: GithubRepo[] | null = null;

export type GithubReposResult = {
  repos: GithubRepo[];
  stale: boolean;
  error?: string;
};

/**
 * Fetches all public, non-fork repositories for GITHUB_USERNAME, most-recently-updated
 * first. Cached server-side via Next.js's fetch cache (tag: "github-repos") and
 * revalidated hourly; see revalidateGithubRepos() for on-demand invalidation via webhook.
 */
export async function fetchGithubRepos(): Promise<GithubReposResult> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`,
      {
        headers: authHeaders(),
        next: { revalidate: REVALIDATE_SECONDS, tags: [REPOS_TAG] },
      }
    );

    if (!res.ok) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      const reason =
        res.status === 403 && remaining === "0"
          ? "GitHub API rate limit exceeded"
          : `GitHub API returned ${res.status} ${res.statusText}`;
      console.error(`[github] ${reason}`);
      if (lastGoodRepos) return { repos: lastGoodRepos, stale: true, error: reason };
      return { repos: [], stale: true, error: reason };
    }

    const raw = (await res.json()) as GithubApiRepo[];
    const repos = raw.filter((r) => !r.fork).map(normalizeRepo);

    lastGoodRepos = repos;
    return { repos, stale: false };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown fetch error";
    console.error("[github] repo fetch threw:", reason);
    if (lastGoodRepos) return { repos: lastGoodRepos, stale: true, error: reason };
    return { repos: [], stale: true, error: reason };
  }
}

/**
 * Extracts a short, honest excerpt from a README's first substantial paragraph —
 * no summarization or invention, just markdown/HTML stripped down to plain text.
 * Used only as a fallback when a repo has no `description` set on GitHub, and only
 * for featured repos (fetching every repo's README would multiply our request count
 * for little benefit — see the N+1 tradeoff note in the /github page).
 */
function extractReadmeExcerpt(markdown: string): string | null {
  for (const rawLine of markdown.split("\n")) {
    let line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("#")) continue; // heading
    if (line.startsWith("![") || line.startsWith("[![")) continue; // image / badge
    if (line.startsWith("<")) continue; // raw HTML block (badge/centering wrappers)
    if (line.startsWith(">")) continue; // blockquote
    if (/^\[[^\]]+\]:\s*http/i.test(line)) continue; // link reference definition
    if (/^(-{3,}|={3,}|\*{3,})$/.test(line)) continue; // horizontal rule

    line = line
      .replace(/<[^>]+>/g, "") // strip any stray HTML tags (defense in depth)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
      .replace(/[*_`]/g, "")
      .trim();

    if (line.length > 40) {
      return line.length > 220 ? `${line.slice(0, 217).trimEnd()}…` : line;
    }
  }
  return null;
}

export async function fetchReadmeExcerpt(repoName: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/readme`, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS, tags: [REPOS_TAG, `github-readme-${repoName}`] },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { content?: string; encoding?: string };
    if (!data.content) return null;

    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return extractReadmeExcerpt(decoded);
  } catch (err) {
    console.error(`[github] readme fetch failed for ${repoName}:`, err);
    return null;
  }
}

export { REPOS_TAG as GITHUB_REPOS_CACHE_TAG };
