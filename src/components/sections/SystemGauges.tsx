import { HudGauge, HudStatus } from "@/components/hud/primitives";
import { getPublishedProjects } from "@/lib/projects";
import { getPublishedResearch } from "@/lib/research";
import { getPublishedSkillGroups } from "@/lib/skillGroups";
import { fetchGithubRepos } from "@/lib/github";

/**
 * Real portfolio counts rendered as cockpit gauges — every number here is
 * a genuine count from the same data the rest of the site reads, not a
 * fabricated metric.
 */
export default async function SystemGauges() {
  const [projects, research, skillGroups, github] = await Promise.all([
    getPublishedProjects(),
    getPublishedResearch(),
    getPublishedSkillGroups(),
    fetchGithubRepos(),
  ]);
  const researchCount = research.length;
  const skillCount = skillGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <section className="wireframe-divider-top px-6 py-[35px] md:px-10">
      <div className="grid gap-[25px] sm:grid-cols-2 lg:grid-cols-4">
        <HudGauge
          label="Projects"
          value={projects.length}
          max={Math.max(projects.length, 6)}
          display={String(projects.length)}
        />
        <HudGauge
          label="Research"
          value={researchCount}
          max={Math.max(researchCount, 3)}
          display={researchCount > 0 ? "ACTIVE" : "NONE"}
        />
        <HudGauge
          label="GitHub"
          value={github.stale ? 0 : github.repos.length}
          max={Math.max(github.repos.length, 1)}
          display={github.stale ? "CACHED" : "SYNCED"}
        />
        <HudGauge label="Skills" value={skillCount} max={skillCount} display={String(skillCount)} />
      </div>

      <div className="mt-[25px] flex flex-wrap gap-x-[25px] gap-y-[8px]">
        <HudStatus label="System Online" tone="on" live />
        <HudStatus label={github.stale ? "GitHub Cached" : "GitHub Synced"} tone={github.stale ? "warn" : "on"} live={!github.stale} />
        <HudStatus label={researchCount > 0 ? "Research Active" : "Research Idle"} tone={researchCount > 0 ? "on" : "off"} />
        <HudStatus label="Contact Channel Open" tone="on" />
      </div>
    </section>
  );
}
