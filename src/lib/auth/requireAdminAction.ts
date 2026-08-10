import "server-only";
import { getCurrentAdmin, type CurrentAdmin } from "@/lib/auth/session";

/**
 * Guard for Server Actions. The protected layout only gates page *rendering*
 * — a Server Action reference, once shipped to the client, is its own POST
 * endpoint and does not automatically re-run the layout that happened to
 * render the page it came from. Every mutating action must call this itself.
 */
export async function requireAdminAction(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}
