import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { profile as staticProfile } from "@/lib/data";
import ProfileForm, { type ProfileFormInitialValues } from "./ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function AdminProfilePage() {
  let profile = await prisma.profile.findUnique({
    where: { id: "singleton" },
    include: { profileImage: true },
  });

  // First visit: seed the singleton row from the real, hand-verified static
  // profile so the form starts populated with actual data, not blank fields.
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: "singleton",
        name: staticProfile.name,
        initials: staticProfile.initials,
        tagline: staticProfile.tagline,
        location: staticProfile.location,
        email: staticProfile.email,
        githubUrl: staticProfile.links.github,
        linkedinUrl: staticProfile.links.linkedin,
        summary: staticProfile.summary,
        heroLines: staticProfile.heroLines,
      },
      include: { profileImage: true },
    });
  }

  const initial: ProfileFormInitialValues = {
    name: profile.name,
    initials: profile.initials,
    tagline: profile.tagline,
    location: profile.location,
    email: profile.email,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    summary: profile.summary,
    heroLine1: profile.heroLines[0] ?? "",
    heroLine2: profile.heroLines[1] ?? "",
    heroLine3: profile.heroLines[2] ?? "",
    profileImageUrl: profile.profileImage?.url ?? null,
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted">
        Controls your identity, tagline, and hero copy across the public site — the homepage, About page, Footer,
        and Contact section all read from this.
      </p>

      <div className="mt-6">
        <ProfileForm initial={initial} />
      </div>
    </div>
  );
}
