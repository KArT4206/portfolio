import "server-only";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import type { StorageProvider } from "./types";

// Deliberately outside public/ — files here are only ever reachable through
// the /api/media/[key] proxy route, which enforces per-attachment visibility
// before serving a single byte. Direct static serving would bypass that.
const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

function resolveSafePath(key: string): string {
  // `key` is always a value we generated ourselves (see generateStorageKey in
  // src/lib/storage/index.ts), never taken from user input — but resolving
  // and re-checking the prefix here is a free, cheap defense against a
  // future caller accidentally passing something path-traversal-shaped.
  const resolved = path.resolve(UPLOAD_DIR, key);
  if (!resolved.startsWith(UPLOAD_DIR + path.sep)) {
    throw new Error("Refusing to resolve a storage key outside the upload directory.");
  }
  return resolved;
}

export const localStorageProvider: StorageProvider = {
  async upload(key, buffer) {
    const filePath = resolveSafePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
  },

  async read(key) {
    return readFile(resolveSafePath(key));
  },

  async delete(key) {
    await unlink(resolveSafePath(key)).catch((err) => {
      if (err.code !== "ENOENT") throw err;
    });
  },
};
