// Migrates the hand-authored Research/Award/Experience content from
// src/lib/data.ts (and the projects that originally carried the research
// papers) into the database, so it becomes admin-editable. One-time
// migration, not something that runs on every deploy. Idempotent: matches
// existing rows by title/org and updates them rather than duplicating.
//
// Run with: npx tsx prisma/seed-research-awards-experience.ts

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { experience as staticExperience, honors as staticHonors } from "../src/lib/data";

const RESEARCH_ENTRIES = [
  {
    title: "Fog-Based Multi-Node Environmental Anomaly Detection on ESP32",
    description:
      "Co-authored research paper proposing a three-tier fog-computing safety system built entirely on commodity ESP32 microcontrollers, delivering cloud-free, sub-200ms fire and intrusion detection.",
    authors: ["Karthik B"],
    conference: null as string | null,
    status: "PUBLISHED" as const,
    year: 2026,
    doi: null as string | null,
    paperUrl: null as string | null,
    metrics: [
      { label: "F1-score (fire / intrusion)", value: "95.0% / 95.2%" },
      { label: "AUC-ROC", value: "0.974 / 0.981" },
      { label: "False-positive reduction", value: "65% (17% → 6%)" },
      { label: "End-to-end latency", value: "180ms avg (13.3x faster than cloud MQTT)" },
      { label: "Wireless packet delivery", value: "97.3% over 60 min" },
      { label: "Total hardware cost", value: "₹2,356 (~$28)" },
    ],
    featured: true,
    published: true,
  },
  {
    title: "Intelligent Traffic Monitoring and Management for Real-Time Vehicle Tracking in Smart Cities",
    description:
      "Co-authored and presented at the 3rd International Conference on Data Science and Business Systems (ICDSBS 2026), organized with IEEE Madras & Singapore Sections at SRM Institute of Science and Technology — received the Best Paper Award.",
    authors: ["Karthik B"],
    conference: "ICDSBS 2026 (IEEE Madras & Singapore Sections)",
    status: "PRESENTED" as const,
    year: 2026,
    doi: null as string | null,
    paperUrl: null as string | null,
    metrics: [{ label: "Recognition", value: "Best Paper Award, ICDSBS 2026" }],
    featured: true,
    published: true,
  },
  {
    title: "Multi-Heuristic Phishing Detection System Using TLS, WHOIS, and OCR",
    description:
      "Presented research on combining TLS certificate validation, WHOIS domain analysis, OCR, and CLIP-based visual similarity into a single phishing-detection trust score.",
    authors: ["Karthik B"],
    conference: "ICAISDGs 2025",
    status: "PRESENTED" as const,
    year: 2025,
    doi: null as string | null,
    paperUrl: null as string | null,
    metrics: [] as { label: string; value: string }[],
    featured: false,
    published: true,
  },
];

const AWARD_ENTRIES = staticHonors.map((h) => {
  // "Best Paper Award\n\n3rd International Conference on Data Science &
  // Business Systems (ICDSBS 2026, IEEE Madras & Singapore Sections) —
  // "Intelligent Traffic Monitoring..."" — split organization out of the
  // freeform detail text where it cleanly leads the sentence.
  const orgMatch = h.detail.match(/^([^—]+?)\s*—/);
  return {
    title: h.title,
    organization: orgMatch ? orgMatch[1].trim() : null,
    detail: h.detail,
    year: null as number | null,
    published: true,
    featured: h.title === "Best Paper Award",
  };
});

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const [index, r] of RESEARCH_ENTRIES.entries()) {
    const existing = await prisma.research.findFirst({ where: { title: r.title } });
    const data = {
      title: r.title,
      description: r.description,
      authors: r.authors,
      conference: r.conference,
      status: r.status,
      year: r.year,
      doi: r.doi,
      paperUrl: r.paperUrl,
      metrics: r.metrics as never,
      featured: r.featured,
      published: r.published,
    };
    if (existing) {
      await prisma.research.update({ where: { id: existing.id }, data });
      console.log(`Updated research: ${r.title}`);
    } else {
      await prisma.research.create({ data: { ...data, displayOrder: index } });
      console.log(`Created research: ${r.title}`);
    }
  }

  for (const [index, a] of AWARD_ENTRIES.entries()) {
    const existing = await prisma.award.findFirst({ where: { title: a.title } });
    const data = {
      title: a.title,
      organization: a.organization,
      detail: a.detail,
      year: a.year,
      published: a.published,
      featured: a.featured,
    };
    if (existing) {
      await prisma.award.update({ where: { id: existing.id }, data });
      console.log(`Updated award: ${a.title}`);
    } else {
      await prisma.award.create({ data: { ...data, displayOrder: index } });
      console.log(`Created award: ${a.title}`);
    }
  }

  for (const [index, e] of staticExperience.entries()) {
    const existing = await prisma.experience.findFirst({ where: { org: e.org, role: e.role } });
    const data = {
      org: e.org,
      role: e.role,
      location: e.location,
      bullets: e.bullets,
      published: true,
      // Team Blitz Racing's known real start is September 2024, still
      // ongoing — the only entry in static data, hand-mapped here rather
      // than parsed, since e.dates is freeform elsewhere in the source.
      startDate: e.org === "Team Blitz Racing" ? new Date(Date.UTC(2024, 8, 1)) : null,
      endDate: null,
    };
    if (existing) {
      await prisma.experience.update({ where: { id: existing.id }, data });
      console.log(`Updated experience: ${e.org}`);
    } else {
      await prisma.experience.create({ data: { ...data, displayOrder: index } });
      console.log(`Created experience: ${e.org}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
