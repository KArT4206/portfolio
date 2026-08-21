// Migrates the hand-authored GitHub presentation config from
// src/lib/repoConfig.ts into the database, so it becomes admin-editable —
// this is what the public site now reads from instead of the static file.
// One-time migration, not something that runs on every deploy. Idempotent:
// upserts by repoName rather than duplicating.
//
// Run with: npx tsx prisma/seed-github-overrides.ts

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  featuredRepositories,
  hiddenRepositories,
  repositoryAliases,
  repositoryCategories,
  customProjectOrder,
  caseStudyLinks,
} from "../src/lib/repoConfig";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const allRepoNames = new Set<string>([
    ...featuredRepositories,
    ...hiddenRepositories,
    ...Object.keys(repositoryAliases),
    ...Object.keys(repositoryCategories),
    ...customProjectOrder,
    ...Object.keys(caseStudyLinks),
  ]);

  for (const repoName of allRepoNames) {
    const displayOrderIndex = customProjectOrder.indexOf(repoName);
    const data = {
      alias: repositoryAliases[repoName] ?? null,
      categories: repositoryCategories[repoName] ?? [],
      featured: featuredRepositories.includes(repoName),
      hidden: hiddenRepositories.includes(repoName),
      displayOrder: displayOrderIndex === -1 ? null : displayOrderIndex,
      caseStudySlug: caseStudyLinks[repoName] ?? null,
    };

    await prisma.githubRepoOverride.upsert({
      where: { repoName },
      create: { repoName, ...data },
      update: data,
    });
    console.log(`Upserted GitHub override: ${repoName}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
