import Reveal from "@/components/Reveal";
import type { PublicProfile } from "@/lib/profile";

export default function AboutCircle({ profile }: { profile: PublicProfile }) {
  const firstName = profile.name.split(" ")[0];
  const circleText = `Hi! I'm ${firstName} • I build things that ship • `;

  return (
    <section id="about" className="scroll-mt-20 overflow-hidden bg-white px-6 py-24 text-black md:px-10 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">About me</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Hi! I&apos;m {firstName}
            <span className="block text-black/40">engineer · researcher · builder</span>
          </h2>
          <p className="mt-6 max-w-lg leading-relaxed text-black/70">{profile.summary}</p>

          <blockquote className="mt-10 border-l-2 border-black pl-5">
            <p className="font-serif-display text-2xl italic leading-snug">
              &ldquo;Ship it, measure it, prove it — then make it better.&rdquo;
            </p>
            <footer className="mt-3 text-sm">
              <span className="font-semibold">{profile.name}</span>
              <span className="text-black/50"> — {profile.tagline}</span>
            </footer>
          </blockquote>
        </Reveal>

        <Reveal delay={0.1} className="flex justify-center">
          <div className="relative aspect-square w-full max-w-[380px]">
            <svg viewBox="0 0 300 300" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <path id="about-circle" d="M150,150 m-120,0 a120,120 0 1,1 240,0 a120,120 0 1,1 -240,0" />
              </defs>
              <text className="font-serif-display" fontSize="22" letterSpacing="1.5" fill="currentColor">
                <textPath href="#about-circle" textLength="748">
                  {circleText}
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-[27%] flex items-center justify-center overflow-hidden rounded-full bg-black text-white">
              {profile.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.imageUrl} alt={profile.name} className="h-full w-full object-cover grayscale" />
              ) : (
                <span className="font-display text-4xl font-black">{profile.initials}</span>
              )}
            </div>
            <span className="sr-only">{circleText}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
