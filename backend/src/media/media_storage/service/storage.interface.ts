export interface MediaStorage {
  save(url: string, buffer: Buffer): Promise<string>;
  get(url: string): Promise<Buffer>;
  delete(url: string): Promise<void>;
}
