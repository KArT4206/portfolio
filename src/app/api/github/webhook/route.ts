import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createHmac, timingSafeEqual } from "crypto";
import { GITHUB_REPOS_CACHE_TAG } from "@/lib/github";

// Events that mean "the repo list or its metadata may have changed" —
// covers create/delete/rename/archive/description/topics/etc. `push` is
// included so README edits are picked up too.
const RELEVANT_EVENTS = new Set(["repository", "push"]);

function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(`sha256=${expected}`);
  const providedBuf = Buffer.from(signatureHeader);

  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * GitHub webhook receiver for instant cache invalidation.
 *
 * Setup: repo Settings → Webhooks → Add webhook
 *   Payload URL: https://<your-domain>/api/github/webhook
 *   Content type: application/json
 *   Secret: same value as the GITHUB_WEBHOOK_SECRET env var (set in Vercel,
 *           never committed — see .env.example)
 *   Events: "Repositories" and "Pushes" (or "Send me everything")
 *
 * Without this configured, the site still self-updates via the 1-hour
 * fetch revalidation in src/lib/github.ts — this route just makes changes
 * appear immediately instead of within the hour.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[github webhook] GITHUB_WEBHOOK_SECRET is not set — refusing request");
    return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 501 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!isValidSignature(rawBody, signature, secret)) {
    console.warn("[github webhook] signature verification failed");
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event") ?? "unknown";

  if (RELEVANT_EVENTS.has(event)) {
    // Next.js 16's revalidateTag requires a cache-life "profile" as the second
    // argument; "max" means invalidate immediately regardless of any configured
    // max age, which is what an on-demand webhook trigger should do.
    revalidateTag(GITHUB_REPOS_CACHE_TAG, "max");
    console.log(`[github webhook] revalidated "${GITHUB_REPOS_CACHE_TAG}" for event "${event}"`);
  }

  return NextResponse.json({ ok: true, event, revalidated: RELEVANT_EVENTS.has(event) });
}
