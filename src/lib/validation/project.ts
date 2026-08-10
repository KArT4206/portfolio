import { z } from "zod";

export const PROJECT_STATUSES = ["IN_DEVELOPMENT", "COMPLETED", "RESEARCH", "PAUSED", "ARCHIVED"] as const;

export const PROJECT_CATEGORIES = [
  "SOFTWARE_ENGINEERING",
  "FULL_STACK",
  "AI_ML",
  "CYBERSECURITY",
  "EMBEDDED_SYSTEMS",
  "IOT",
  "RESEARCH",
  "HARDWARE",
  "OTHER",
] as const;

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.url().optional())
  .optional();

const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : new Date(v)))
  .optional();

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .max(200)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/i, "Use letters, numbers, and hyphens only")
    .optional()
    .or(z.literal("")),
  shortDescription: z.string().trim().min(1, "Short description is required").max(400),
  detailedDescription: z.string().trim().max(5000).optional().or(z.literal("")),
  role: z.string().trim().max(300).optional().or(z.literal("")),
  technologies: z.string().trim().max(1000).optional().or(z.literal("")), // comma-separated in the form
  githubUrl: optionalUrl,
  demoUrl: optionalUrl,
  docsUrl: optionalUrl,
  paperUrl: optionalUrl,
  startDate: optionalDate,
  endDate: optionalDate,
  status: z.enum(PROJECT_STATUSES),
  categories: z.array(z.enum(PROJECT_CATEGORIES)).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export function parseTechnologies(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
