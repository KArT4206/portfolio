import { z } from "zod";

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

export const certificationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(300),
  issuer: z.string().trim().min(1, "Issuer is required").max(300),
  credentialId: z.string().trim().max(200).optional().or(z.literal("")),
  credentialUrl: optionalUrl,
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  issueDate: optionalDate,
  expiresDate: optionalDate, // omitted/empty = does not expire
  published: z.boolean().default(false),
});

export type CertificationFormValues = z.infer<typeof certificationSchema>;
