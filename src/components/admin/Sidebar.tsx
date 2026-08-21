"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Briefcase,
  GraduationCap,
  Sparkles,
  FileText,
  BookOpen,
  Award,
  BadgeCheck,
  ImageIcon,
  FileDown,
  Settings,
  Mail,
  ScrollText,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/SocialIcons";
import { logoutAction } from "@/app/admin/(protected)/actions";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  comingSoon?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/research", label: "Research", icon: FileText },
  { href: "/admin/publications", label: "Publications", icon: BookOpen },
  { href: "/admin/awards", label: "Awards", icon: Award },
  { href: "/admin/certifications", label: "Certifications", icon: BadgeCheck },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/resume", label: "Resume", icon: FileDown },
  { href: "/admin/github", label: "GitHub", icon: GithubIcon },
  { href: "/admin/messages", label: "Contact Messages", icon: Mail },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/change-password", label: "Security", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
];

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <span className="font-display text-lg font-semibold">
          KB<span className="text-accent">.</span>
        </span>
        <span className="text-xs text-muted">Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            if (item.comingSoon) {
              return (
                <li key={item.href}>
                  <span className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm text-muted/50">
                    <span className="flex items-center gap-2.5">
                      <Icon size={16} />
                      {item.label}
                    </span>
                    <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px]">Soon</span>
                  </span>
                </li>
              );
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <span className="truncate text-xs text-muted">{username}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Logout"
              className="text-muted transition-colors hover:text-red-400"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
