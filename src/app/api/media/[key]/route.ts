import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getStorageProvider } from "@/lib/storage";
import { sanitizeFilename } from "@/lib/storage/validate";

/**
 * The only way any uploaded file is ever served, for both storage providers
 * (see the comments in src/lib/storage/local.ts and vercelBlob.ts) — so
 * visibility is enforced in exactly one place regardless of where the bytes
 * actually live.
 *
 * A media file is publicly servable if it's used as a project's cover image
 * (always public once the project itself is published) or attached to at
 * least one PUBLIC-visibility attachment. Anything else requires an
 * authenticated admin session. Unknown/unauthorized keys both 404 — a 403
 * would confirm to an outside prober that the key exists.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key: rawKey } = await params;
  const key = decodeURIComponent(rawKey);

  const media = await prisma.media.findUnique({
    where: { key },
    include: {
      projectAttachments: { select: { visibility: true } },
      projectCoverOf: { select: { published: true, deletedAt: true } },
    },
  });

  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isPublicCover = media.projectCoverOf.some((p) => p.published && !p.deletedAt);
  const isPublicAttachment = media.projectAttachments.some((a) => a.visibility === "PUBLIC");

  // Private attachments, and files not yet attached to anything (mid-edit,
  // or awaiting a decision) both fall through to here — admin-only.
  if (!isPublicCover && !isPublicAttachment) {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buffer = await getStorageProvider().read(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Disposition": `inline; filename="${sanitizeFilename(media.originalName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error(`[media] failed to read key "${key}":`, err);
    return NextResponse.json({ error: "File unavailable" }, { status: 500 });
  }
}
