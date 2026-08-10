import "server-only";
import { put, del, head } from "@vercel/blob";
import type { StorageProvider } from "./types";

// Vercel Blob public URLs are guessable-but-unlisted, not access-controlled —
// so like the local provider, callers should go through /api/media/[key]
// for anything that needs visibility gating, rather than linking the raw
// blob URL directly.
export const vercelBlobStorageProvider: StorageProvider = {
  async upload(key, buffer, mimeType) {
    await put(key, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });
  },

  async read(key) {
    const info = await head(key);
    const res = await fetch(info.url);
    if (!res.ok) throw new Error(`Failed to read blob "${key}": ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  },

  async delete(key) {
    await del(key);
  },
};
