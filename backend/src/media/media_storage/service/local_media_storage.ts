import { MediaStorage } from "./storage.interface";
import path from "node:path";
import fs from "fs";
import { NotFoundException } from "@nestjs/common";

/**
 * This handles all functionality in terms of media storage.
 * note: this is also used to fetch prints or PDF files.
 */
export class LocalMediaStorage implements MediaStorage {
  private readonly baseDir = path.join(process.cwd(), "../assets/media"); // dev assets folder

  /**
   * This function saves a piece of media to the media storage
   * @param relativePath is the path where you want to save it (relative)
   * @param buffer is the photo data
   * @returns the url if successful
   * note: this is the dev impl and will save to the assets/media folder instead.
   */
  async save(relativePath: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.baseDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return relativePath;
  }

  /**
   * This function gets a piece of media from the storage
   * @param relativePath is the path where you want to fetch media from (relative)
   * @returns the media if it exists.
   * note: this is the dev impl and will fetch from the assets/media folder instead.
   */
  async get(relativePath: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, relativePath);
    if (!fs.existsSync(filePath))
      throw new NotFoundException(`Media not found: ${relativePath}`);
    return fs.readFileSync(filePath);
  }

  /**
   * This function deletes a piece of media from storage
   * @param relativePath is the path you want to delete the media from (relative)
   * note: this is the dev impl and will delete from assets/media.
   */
  async delete(relativePath: string): Promise<void> {
    const filePath = path.join(this.baseDir, relativePath);
    if (!fs.existsSync(filePath))
      throw new NotFoundException(`Media not found: ${relativePath}`);
    fs.unlinkSync(filePath);
  }
}
