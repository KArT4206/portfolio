import { NextResponse } from "next/server";
import { getPublishedProjects } from "@/lib/projects";
import { getPublishedResearch } from "@/lib/research";
import { getPublishedAwards } from "@/lib/awards";

// Backs the hidden terminal easter egg's `projects`/`research`/`awards`
// commands with the exact same published, CMS-managed data the rest of the
// site reads — no separate/fake dataset.
export async function GET() {
  const [projects, research, awards] = await Promise.all([
    getPublishedProjects(),
    getPublishedResearch(),
    getPublishedAwards(),
  ]);

  return NextResponse.json({
    projects: projects.map((p) => ({ title: p.shortTitle, status: p.status, slug: p.slug })),
    research: research.map((r) => ({ title: r.title, status: r.status })),
    awards: awards.map((a) => ({ title: a.title, year: a.year })),
  });
}
