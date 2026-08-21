import Hero from "@/components/sections/Hero";
import SystemGauges from "@/components/sections/SystemGauges";
import Mission from "@/components/sections/Mission";
import FeaturedWork from "@/components/sections/FeaturedWork";
import Research from "@/components/sections/Research";
import Awards from "@/components/sections/Awards";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import { getAllPublishedSlugs } from "@/lib/projects";
import { getProfile } from "@/lib/profile";
import { getSiteSettings } from "@/lib/siteSettings";

export default async function Home() {
  const [projectSlugs, profile, settings] = await Promise.all([
    getAllPublishedSlugs(),
    getProfile(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero
        projectSlugs={projectSlugs}
        profile={profile}
        showTerminalButton={settings.funModeEnabled && settings.terminalEnabled}
      />
      <SystemGauges />
      <Mission />
      <FeaturedWork />
      <Research />
      <Awards />
      <Skills />
      <Contact email={profile.email} />
    </>
  );
}
