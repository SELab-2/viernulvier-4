import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MediaStorageService {
  private readonly mediaBase: string;

  constructor(private readonly configService: ConfigService) {
    try {
      // Automatically throws if undefined, and guarantees a string return type
      this.mediaBase = this.configService.getOrThrow<string>("MEDIA_BASE_URL");
    } catch {
      throw new Error("Forgot to set MEDIA_BASE_URL .env variable?");
    }
  }

  /**
   * This function saves a piece of media to the media storage
   * @param url is the url where you want to save it
   * @param buffer is the photo data
   * @returns the url if successful
   * note: this is the production impl and thus will save to the given url.
   */
  async saveMedia(url: string, buffer: Buffer): Promise<string> {
    const newUrl = this.getFormattedUrl(url);
    const response = await fetch(newUrl, {
      method: "PUT",
      body: buffer.buffer as ArrayBuffer,
    });
    if (!response.ok)
      throw new BadRequestException(
        `Failed to save media: ${response.statusText}`,
      );
    return url; // note: returns the relative path in case of relative saving!
    // this is important for saving the relative paths elsewhere like the db.
  }

  /**
   * This function gets a piece of media from the storage
   * @param url is the url you want to fetch the media from
   * @returns the media if it exists.
   * note: this is the production impl and thus will call the url itself.
   */
  async getMedia(url: string): Promise<Buffer> {
    const newUrl = this.getFormattedUrl(url);
    const response = await fetch(newUrl);
    if (response.status === 404)
      throw new NotFoundException(`Media not found: ${url}`);
    if (!response.ok)
      throw new BadRequestException(
        `Failed to get media: ${response.statusText}`,
      );
    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * This function deletes a piece of media from storage
   * @param url is the url you want to delete the media from
   * note: this is the production impl and thus will call from the url.
   */
  async deleteMedia(url: string): Promise<void> {
    const newUrl = this.getFormattedUrl(url);
    const response = await fetch(newUrl, { method: "DELETE" });
    if (!response.ok)
      throw new Error(`Failed to delete media: ${response.statusText}`);
  }

  /**
   * Helper method for formating the url for absolute & relative paths.
   * note: the relative path will use your mediaBaseUrl env var as base path.
   * @param url is the url we want formated
   * @returns the formated url (absolute url)
   */
  getFormattedUrl(url: string): string {
    if (url.startsWith("http")) {
      return url;
    }
    return `${this.mediaBase}${url}`;
  }
}
