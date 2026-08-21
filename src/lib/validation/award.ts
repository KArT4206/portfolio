import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.url().optional())
  .optional();

export const awardSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  organization: z.string().trim().max(300).optional().or(z.literal("")),
  detail: z.string().trim().max(3000).optional().or(z.literal("")),
  year: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(z.number().int().min(1990).max(2100).optional())
    .optional(),
  certificateUrl: optionalUrl,
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type AwardFormValues = z.infer<typeof awardSchema>;
