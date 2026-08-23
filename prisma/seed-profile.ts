// Bootstraps the Profile singleton row from the real, hand-verified bio if
// (and only if) it doesn't exist yet — mirrors the SiteSetting/Profile
// upsert-on-read pattern used at request time. Never overwrites an existing
// row (update: {} is a no-op), so an admin edit made after this ran is
// always preserved on subsequent deploys.
//
// Run with: npx tsx prisma/seed-profile.ts

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { profile as staticProfile } from "../src/lib/data";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const row = await prisma.profile.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      name: staticProfile.name,
      initials: staticProfile.initials,
      tagline: staticProfile.tagline,
      location: staticProfile.location,
      email: staticProfile.email,
      githubUrl: staticProfile.links.github,
      linkedinUrl: staticProfile.links.linkedin,
      summary: staticProfile.summary,
      heroLines: staticProfile.heroLines,
    },
    update: {},
  });

  console.log(`Profile singleton ready: ${row.name}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
