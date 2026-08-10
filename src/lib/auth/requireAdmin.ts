import "server-only";
import { NextResponse } from "next/server";
import { getCurrentAdmin, type CurrentAdmin } from "@/lib/auth/session";

/**
 * Guard for /api/admin/* route handlers. Usage:
 *
 *   const admin = await requireAdmin();
 *   if (admin instanceof NextResponse) return admin; // 401, already-formed response
 *   // ...admin.user is available past this point
 */
export async function requireAdmin(): Promise<CurrentAdmin | NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return admin;
}
