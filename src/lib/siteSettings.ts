import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SiteSettings = {
  funModeEnabled: boolean;
  matrixInteractionEnabled: boolean;
  ghostEnabled: boolean;
  arcadeEnabled: boolean;
  robotEnabled: boolean;
  explorerEnabled: boolean;
  terminalEnabled: boolean;
  idleEventsEnabled: boolean;
  soundDefaultOn: boolean;
  maxWarpEnabled: boolean;
};

const DEFAULTS: SiteSettings = {
  funModeEnabled: true,
  matrixInteractionEnabled: true,
  ghostEnabled: true,
  arcadeEnabled: true,
  robotEnabled: true,
  explorerEnabled: true,
  terminalEnabled: true,
  idleEventsEnabled: true,
  soundDefaultOn: false,
  maxWarpEnabled: true,
};

async function fetchSiteSettings(): Promise<SiteSettings> {
  // Upsert-on-read guarantees the singleton row exists without needing a
  // separate seed step. Static generation runs multiple pages concurrently,
  // so two workers can race to create it at once — the loser's `create`
  // hits a unique-constraint violation (P2002), not a real failure; it
  // just means the row now exists, so re-read it instead of falling back.
  let row;
  try {
    row = await prisma.siteSetting.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });
  } catch (err) {
    const isUniqueConflict =
      err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002";
    if (!isUniqueConflict) throw err;
    row = await prisma.siteSetting.findUniqueOrThrow({ where: { id: "singleton" } });
  }
  return {
    funModeEnabled: row.funModeEnabled,
    matrixInteractionEnabled: row.matrixInteractionEnabled,
    ghostEnabled: row.ghostEnabled,
    arcadeEnabled: row.arcadeEnabled,
    robotEnabled: row.robotEnabled,
    explorerEnabled: row.explorerEnabled,
    terminalEnabled: row.terminalEnabled,
    idleEventsEnabled: row.idleEventsEnabled,
    soundDefaultOn: row.soundDefaultOn,
    maxWarpEnabled: row.maxWarpEnabled,
  };
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[siteSettings] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => safely(DEFAULTS, fetchSiteSettings),
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 3600 }
);
