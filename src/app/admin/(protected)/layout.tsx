import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/session";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

// This is the actual security boundary for every /admin/* page except
// /admin/login — it runs server-side on every request with no client-trust
// shortcut. proxy.ts also redirects unauthenticated requests before
// this even renders, but that's a fast-path UX optimization, not the
// authorization check itself; this layout is authoritative on its own.
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex">
      <Sidebar username={admin.user.username} />
      <div className="min-h-screen flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
