import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  initials: z.string().trim().min(1, "Initials are required").max(10),
  tagline: z.string().trim().min(1, "Tagline is required").max(300),
  location: z.string().trim().min(1, "Location is required").max(200),
  email: z.email("Enter a valid email"),
  githubUrl: z.url("Enter a valid URL"),
  linkedinUrl: z.url("Enter a valid URL"),
  summary: z.string().trim().min(1, "Summary is required").max(3000),
  heroLine1: z.string().trim().max(200).optional().or(z.literal("")),
  heroLine2: z.string().trim().max(200).optional().or(z.literal("")),
  heroLine3: z.string().trim().max(200).optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
