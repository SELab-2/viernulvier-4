import { MediaStorage } from "./storage.interface";
import path from "node:path";
import fs from "fs";
import { NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * This handles all functionality in terms of media storage.
 * note: this is also used to fetch prints or pdf files.
 */
export class LocalMediaStorage implements MediaStorage {
  constructor(private readonly configService: ConfigService) {}

  private readonly baseDir = path.join(process.cwd(), "../assets/media"); // dev assets folder

  private get baseUrl() {
    return this.configService.get<string>(
      "MEDIA_BASE_URL",
      "http://127.0.0.1/photos",
    );
  }

  /**
   * This function saves a piece of media to the media storage
   * @param url is the url where you want to save it (including the base url)
   * @param buffer is the photo data
   * @returns the url if successful
   * note: this is the dev impl and will save to the assets/media folder instead.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async save(url: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.baseDir, url.replace(this.baseUrl, ""));
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return url;
  }

  /**
   * This function gets a piece of media from the storage
   * @param url is the url (including base) you want to fetch the media from
   * @returns the media if it exists.
   * note: this is the dev impl and will fetch from the assets/media folder instead.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async get(url: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, url.replace(this.baseUrl, ""));
    if (!fs.existsSync(filePath))
      throw new NotFoundException(`Media not found: ${url}`);
    return fs.readFileSync(filePath);
  }

  /**
   * This function deletes a piece of media from storage
   * @param url is the url (including base) you want to delete the media from
   * note: this is the dev impl and will delete from assets/media.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(url: string): Promise<void> {
    const filePath = path.join(this.baseDir, url.replace(this.baseUrl, ""));
    if (!fs.existsSync(filePath))
      throw new NotFoundException(`Media not found: ${url}`);
    fs.unlinkSync(filePath);
  }
}
