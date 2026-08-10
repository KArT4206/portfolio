import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

// Never let search engines or link previews index the admin surface.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <LoginForm />
    </div>
  );
}
