import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { saveSiteSettingsAction } from "./actions";

export const metadata: Metadata = { title: "Site Settings" };

const TOGGLES: { key: string; label: string; description: string }[] = [
  { key: "funModeEnabled", label: "Fun Mode", description: "Master switch — turns off every fun feature below at once." },
  { key: "matrixInteractionEnabled", label: "Matrix Interaction", description: "Cursor tracking and ripple effects on the background dot field." },
  { key: "ghostEnabled", label: "Ghost", description: "The hidden ghost mascot and its Catch the Ghost mini-game." },
  { key: "arcadeEnabled", label: "Arcade", description: "Snake, Neon Maze, and XOX games." },
  { key: "robotEnabled", label: "Robot", description: "The repair-robot mascot that occasionally crosses the screen." },
  { key: "explorerEnabled", label: "Explorer", description: "The floating explorer pod easter egg." },
  { key: "terminalEnabled", label: "Terminal", description: "The hidden command-line easter egg." },
  { key: "idleEventsEnabled", label: "Idle Events", description: "Ambient events triggered after ~25s of inactivity." },
  { key: "soundDefaultOn", label: "Sound Default ON", description: "Whether arcade sound starts on for new visitors (they can always toggle it)." },
  { key: "maxWarpEnabled", label: "Maximum Warp (Konami)", description: "The hidden keyboard-sequence secret mode." },
];

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Site Settings</h1>
      <p className="mt-1 text-sm text-muted">Fun / Experiments — toggle the optional easter-egg layer on the public site.</p>

      <form action={saveSiteSettingsAction} className="mt-8 flex max-w-2xl flex-col gap-4">
        {TOGGLES.map((t) => (
          <label
            key={t.key}
            className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4"
          >
            <div>
              <p className="text-sm font-medium">{t.label}</p>
              <p className="mt-0.5 text-xs text-muted">{t.description}</p>
            </div>
            <input
              type="checkbox"
              name={t.key}
              defaultChecked={Boolean(settings[t.key as keyof typeof settings])}
              className="mt-1 h-5 w-5 shrink-0 accent-accent"
            />
          </label>
        ))}

        <button
          type="submit"
          className="mt-2 w-fit rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
