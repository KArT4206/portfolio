export interface StorageProvider {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
