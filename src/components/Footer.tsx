import Link from "next/link";
import { Mail } from "lucide-react";
import { profile } from "@/lib/data";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-sm font-semibold">{profile.name}</p>
          <p className="mt-1 text-xs text-muted">{profile.location}</p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="rounded-full border border-border p-2.5 text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <GithubIcon width={16} height={16} />
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="rounded-full border border-border p-2.5 text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <LinkedinIcon width={16} height={16} />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="rounded-full border border-border p-2.5 text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Mail size={16} />
          </a>
        </div>

        <p className="text-xs text-muted">
          Built with Next.js &amp; deployed on Vercel. <Link href="/" className="hover:text-foreground">© {new Date().getFullYear()}</Link>
        </p>
      </div>
    </footer>
  );
}
