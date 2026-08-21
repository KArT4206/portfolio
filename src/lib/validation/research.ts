import { z } from "zod";

export const RESEARCH_STATUSES = ["DRAFT", "IN_REVIEW", "PRESENTED", "PUBLISHED"] as const;

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.url().optional())
  .optional();

export const researchSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  authors: z.string().trim().max(500).optional().or(z.literal("")), // comma-separated in the form
  conference: z.string().trim().max(300).optional().or(z.literal("")),
  status: z.enum(RESEARCH_STATUSES),
  year: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(z.number().int().min(1990).max(2100).optional())
    .optional(),
  doi: z.string().trim().max(200).optional().or(z.literal("")),
  paperUrl: optionalUrl,
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type ResearchFormValues = z.infer<typeof researchSchema>;

export function parseAuthors(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

export type MetricRow = { label: string; value: string };

// Metrics are submitted as parallel form-array fields (metricLabel[]/metricValue[])
// rather than a JSON textarea — much harder to submit malformed data that way.
export function parseMetrics(labels: string[], values: string[]): MetricRow[] {
  const rows: MetricRow[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]?.trim();
    const value = values[i]?.trim();
    if (label && value) rows.push({ label, value });
  }
  return rows;
}
