import "server-only";
import { randomUUID } from "crypto";
import type { StorageProvider } from "./types";
import { localStorageProvider } from "./local";
import { vercelBlobStorageProvider } from "./vercelBlob";
import { extensionForMime, sanitizeFilename } from "./validate";

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";
  if (provider === "vercel-blob") return vercelBlobStorageProvider;
  if (provider === "local") return localStorageProvider;
  throw new Error(`Unknown STORAGE_PROVIDER "${provider}" — expected "local" or "vercel-blob".`);
}

// The stored key is always generated server-side, never derived from
// user-supplied input — this is what keeps path traversal and collisions off
// the table regardless of what the original filename looked like.
export function generateStorageKey(mimeType: string): string {
  return `uploads/${randomUUID()}${extensionForMime(mimeType)}`;
}

export { sanitizeFilename };
export * from "./validate";
export type { StorageProvider } from "./types";
