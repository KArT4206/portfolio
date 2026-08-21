import { z } from "zod";

const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : new Date(v)))
  .optional();

export const educationSchema = z.object({
  school: z.string().trim().min(1, "School is required").max(300),
  degree: z.string().trim().min(1, "Degree is required").max(300),
  location: z.string().trim().max(300).optional().or(z.literal("")),
  startDate: optionalDate,
  endDate: optionalDate, // omitted/empty = ongoing / expected
  coursework: z.string().trim().max(2000).optional().or(z.literal("")), // comma-separated in the form
  published: z.boolean().default(false),
});

export type EducationFormValues = z.infer<typeof educationSchema>;

export function parseCoursework(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}
