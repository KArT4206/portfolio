// Migrates the 6 hand-authored case studies from src/lib/data.ts into the
// database, so they become admin-editable like anything else — this is a
// one-time migration, not something that runs on every deploy. Idempotent:
// re-running upserts by slug rather than duplicating.
//
// Run with: npm run db:seed:projects

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { projects as staticProjects } from "../src/lib/data";

const STATUS_MAP: Record<string, "IN_DEVELOPMENT" | "COMPLETED" | "RESEARCH"> = {
  "In Development": "IN_DEVELOPMENT",
  Completed: "COMPLETED",
  Research: "RESEARCH",
};

const CATEGORY_MAP: Record<string, string> = {
  "Full-Stack": "FULL_STACK",
  "AI/ML": "AI_ML",
  Embedded: "EMBEDDED_SYSTEMS",
  Cybersecurity: "CYBERSECURITY",
};

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const [index, p] of staticProjects.entries()) {
    const categories = p.category.map((c) => CATEGORY_MAP[c] ?? "OTHER") as never[];

    const saved = await prisma.project.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        shortTitle: p.shortTitle,
        shortDescription: p.tagline,
        detailedDescription: p.overview,
        problem: p.problem,
        solution: p.solution,
        results: p.results as never,
        role: p.role,
        technologies: p.tech,
        githubUrl: p.repoUrl ?? null,
        status: STATUS_MAP[p.status] ?? "IN_DEVELOPMENT",
        categories,
        featured: p.featured,
        published: true,
        displayOrder: index,
      },
      update: {
        title: p.title,
        shortTitle: p.shortTitle,
        shortDescription: p.tagline,
        detailedDescription: p.overview,
        problem: p.problem,
        solution: p.solution,
        results: p.results as never,
        role: p.role,
        technologies: p.tech,
        githubUrl: p.repoUrl ?? null,
        status: STATUS_MAP[p.status] ?? "IN_DEVELOPMENT",
        categories,
        featured: p.featured,
        displayOrder: index,
      },
    });

    console.log(`✓ ${saved.slug}`);
  }

  console.log(`\nMigrated ${staticProjects.length} projects.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
