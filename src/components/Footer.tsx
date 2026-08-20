import Link from "next/link";
import { Mail } from "lucide-react";
import { profile } from "@/lib/data";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";

export default function Footer() {
  return (
    <footer className="wireframe-divider-top">
      <div className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left md:px-10">
        <div>
          <p className="font-display text-sm font-medium tracking-[0.05em]">{profile.name}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            {profile.location}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="rounded-full border border-border-dim p-2.5 text-muted transition-colors hover:border-accent-yellow hover:text-accent-yellow"
          >
            <GithubIcon width={15} height={15} />
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="rounded-full border border-border-dim p-2.5 text-muted transition-colors hover:border-accent-yellow hover:text-accent-yellow"
          >
            <LinkedinIcon width={15} height={15} />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="rounded-full border border-border-dim p-2.5 text-muted transition-colors hover:border-accent-yellow hover:text-accent-yellow"
          >
            <Mail size={15} />
          </a>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          Next.js // Vercel <Link href="/" className="hover:text-foreground">© {new Date().getFullYear()}</Link>
        </p>
      </div>
    </footer>
  );
}
