import Hero from "@/components/sections/Hero";
import AboutCircle from "@/components/sections/AboutCircle";
import ServicesMarquee from "@/components/sections/ServicesMarquee";
import Freelance from "@/components/sections/Freelance";
import ShowcaseCarousel from "@/components/sections/ShowcaseCarousel";
import Research from "@/components/sections/Research";
import Awards from "@/components/sections/Awards";
import Contact from "@/components/sections/Contact";
import { getFeaturedProjects } from "@/lib/projects";
import { getProfile } from "@/lib/profile";
import { getSiteSettings } from "@/lib/siteSettings";

export default async function Home() {
  const [projects, profile, settings] = await Promise.all([
    getFeaturedProjects(),
    getProfile(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero profile={profile} showTerminalButton={settings.funModeEnabled && settings.terminalEnabled} />
      <AboutCircle profile={profile} />
      <ServicesMarquee />
      <Freelance email={profile.email} />
      <ShowcaseCarousel
        projects={projects.map(({ slug, title, tagline, category, coverImageUrl }) => ({
          slug,
          title,
          tagline,
          category,
          coverImageUrl,
        }))}
      />
      <Research />
      <Awards />
      <Contact email={profile.email} />
    </>
  );
}
