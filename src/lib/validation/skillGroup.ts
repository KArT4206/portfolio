import { z } from "zod";

export const skillGroupSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(200),
  items: z.string().trim().max(2000).optional().or(z.literal("")), // comma-separated in the form
  published: z.boolean().default(false),
});

export type SkillGroupFormValues = z.infer<typeof skillGroupSchema>;

export function parseSkillItems(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
}
