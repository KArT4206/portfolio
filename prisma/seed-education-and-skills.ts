// Migrates the hand-authored Education/Skills content from src/lib/data.ts
// into the database, so it becomes admin-editable. One-time migration, not
// something that runs on every deploy. Idempotent: matches existing rows by
// school/category and updates them rather than duplicating.
//
// Run with: npm run db:seed:content2

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { education as staticEducation, skills as staticSkills } from "../src/lib/data";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const existingEducation = await prisma.education.findFirst({ where: { school: staticEducation.school } });
  const educationData = {
    school: staticEducation.school,
    degree: staticEducation.degree,
    location: null as string | null,
    // staticEducation.dates is the freeform "2023 – 2027 (Expected)" — the
    // public display only ever renders the year, so an exact month is
    // display-irrelevant; the real expected graduation year (2027) is a
    // verified fact and must be preserved, not dropped in favor of null.
    // The public formatter shows "(Expected)" automatically for any future
    // endDate, so a real future date here still renders correctly.
    startDate: new Date(Date.UTC(2023, 6, 1)),
    endDate: new Date(Date.UTC(2027, 6, 1)),
    coursework: staticEducation.coursework,
    published: true,
  };
  if (existingEducation) {
    await prisma.education.update({ where: { id: existingEducation.id }, data: educationData });
    console.log(`Updated education: ${staticEducation.school}`);
  } else {
    await prisma.education.create({ data: { ...educationData, displayOrder: 0 } });
    console.log(`Created education: ${staticEducation.school}`);
  }

  for (const [index, s] of staticSkills.entries()) {
    const existing = await prisma.skillGroup.findFirst({ where: { category: s.category } });
    const data = { category: s.category, items: s.items, published: true };
    if (existing) {
      await prisma.skillGroup.update({ where: { id: existing.id }, data });
      console.log(`Updated skill group: ${s.category}`);
    } else {
      await prisma.skillGroup.create({ data: { ...data, displayOrder: index } });
      console.log(`Created skill group: ${s.category}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
