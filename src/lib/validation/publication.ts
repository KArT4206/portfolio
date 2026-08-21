import { z } from "zod";

export const PUBLICATION_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "PUBLISHED"] as const;

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

export const publicationSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  authors: z.string().trim().max(500).optional().or(z.literal("")), // comma-separated in the form
  journal: z.string().trim().max(300).optional().or(z.literal("")),
  publicationDate: optionalDate,
  doi: z.string().trim().max(200).optional().or(z.literal("")),
  url: optionalUrl,
  status: z.enum(PUBLICATION_STATUSES),
  abstract: z.string().trim().max(5000).optional().or(z.literal("")),
  keywords: z.string().trim().max(1000).optional().or(z.literal("")), // comma-separated in the form
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type PublicationFormValues = z.infer<typeof publicationSchema>;

export function parseAuthors(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

export function parseKeywords(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}
