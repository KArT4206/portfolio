import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getStorageProvider, generateStorageKey, sanitizeFilename, validateFile } from "@/lib/storage";

export type UploadMediaResult =
  | { ok: true; media: { id: string; url: string; originalName: string; mimeType: string; size: number } }
  | { ok: false; error: string };

/**
 * Validates, stores, and records a single uploaded file. This is the one
 * path every admin upload flow (project attachments now; award/publication/
 * certification attachments, resume versions, profile photo later) should
 * go through — it's where the MIME/signature/size checks and the Media
 * bookkeeping live, so none of those call sites can accidentally skip them.
 */
export async function uploadMedia(file: File, uploadedById: string): Promise<UploadMediaResult> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const validation = validateFile(buffer, file.type, buffer.length);
  if (!validation.ok) return { ok: false, error: validation.error };

  const key = generateStorageKey(file.type);
  const sha256 = createHash("sha256").update(buffer).digest("hex");

  await getStorageProvider().upload(key, buffer, file.type);

  const media = await prisma.media.create({
    data: {
      key,
      url: `/api/media/${encodeURIComponent(key)}`,
      originalName: sanitizeFilename(file.name),
      mimeType: file.type,
      size: buffer.length,
      sha256,
      uploadedById,
    },
  });

  return {
    ok: true,
    media: {
      id: media.id,
      url: media.url,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
    },
  };
}
