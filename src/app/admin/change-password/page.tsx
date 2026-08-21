import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/session";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata: Metadata = { title: "Change Password — Admin" };
export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <ChangePasswordForm forced={admin.user.mustChangePassword} />
    </div>
  );
}
