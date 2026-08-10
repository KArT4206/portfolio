import "server-only";

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

// Allowlist per the spec: PDF, images, DOC/DOCX, ZIP where appropriate.
export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
};

export function extensionForMime(mime: string): string {
  return EXTENSION_BY_MIME[mime] ?? "";
}

/**
 * Never trust the declared MIME type or file extension alone — both are
 * client-controlled and trivially spoofed (e.g. renaming a .html file to
 * .png). This checks the file's actual leading bytes against what the
 * claimed type should look like, so a mismatched/malicious upload is
 * rejected even if it passed the MIME allowlist check.
 */
function matchesSignature(bytes: Buffer, mime: string): boolean {
  const b = bytes;
  switch (mime) {
    case "application/pdf":
      return b.subarray(0, 4).toString("ascii") === "%PDF";
    case "image/png":
      return b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "image/gif":
      return b.subarray(0, 4).toString("ascii") === "GIF8";
    case "image/webp":
      return b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP";
    case "application/msword":
      // OLE compound file — also shared by legacy .xls/.ppt, but combined
      // with the declared MIME type this is a reasonable check.
      return b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/zip":
    case "application/x-zip-compressed":
      // docx/zip are all PK-signed zip containers.
      return b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07);
    default:
      return false;
  }
}

/**
 * Strips path separators/traversal and anything outside a conservative safe
 * set — used only for the human-readable metadata name shown in the UI. The
 * actual on-disk/on-blob key is always a generated random name, never this.
 */
export function sanitizeFilename(name: string): string {
  const base = name.replace(/^.*[\\/]/, ""); // strip any directory components
  const cleaned = base.replace(/[^a-zA-Z0-9.\-_ ]/g, "").trim();
  return cleaned.slice(0, 150) || "file";
}

export type FileValidationResult = { ok: true } | { ok: false; error: string };

export function validateFile(buffer: Buffer, declaredMime: string, size: number): FileValidationResult {
  if (size <= 0) return { ok: false, error: "Empty file." };
  if (size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: `File exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.` };
  }
  if (!ALLOWED_MIME_TYPES.has(declaredMime)) {
    return { ok: false, error: `File type "${declaredMime}" is not allowed.` };
  }
  if (!matchesSignature(buffer, declaredMime)) {
    return { ok: false, error: "File content doesn't match its declared type — possibly renamed or corrupted." };
  }
  return { ok: true };
}
