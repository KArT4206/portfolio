import { z } from "zod";

const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : new Date(v)))
  .optional();

export const experienceSchema = z.object({
  org: z.string().trim().min(1, "Organization is required").max(300),
  role: z.string().trim().min(1, "Role is required").max(300),
  location: z.string().trim().max(300).optional().or(z.literal("")),
  startDate: optionalDate,
  endDate: optionalDate, // omitted/empty = present
  bullets: z.string().trim().max(4000).optional().or(z.literal("")), // one per line in the form
  published: z.boolean().default(false),
});

export type ExperienceFormValues = z.infer<typeof experienceSchema>;

export function parseBullets(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
}
