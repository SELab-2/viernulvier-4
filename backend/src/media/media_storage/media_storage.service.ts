import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  MissingEnvVariableError,
  SystemFailureException,
} from "../../common/exceptions";

@Injectable()
export class MediaStorageService {
  private readonly mediaBase: string;

  constructor(private readonly configService: ConfigService) {
    try {
      // Automatically throws if undefined, and guarantees a string return type
      this.mediaBase = this.configService.getOrThrow<string>("MEDIA_BASE_URL");
    } catch {
      throw new MissingEnvVariableError("MEDIA_BASE_URL");
    }
  }

  /**
   * This function saves a piece of media to the media storage
   * @param url is the url where you want to save it
   * @param buffer is the photo data
   * @returns the url if successful
   * note: this is the production impl and thus will save to the given url.
   * @throws SystemFailureException when the media fails to save (500)
   */
  async saveMedia(url: string, buffer: Buffer): Promise<string> {
    const newUrl = this.getFormattedUrl(url);
    const response = await fetch(newUrl, {
      method: "PUT",
      body: buffer.buffer as ArrayBuffer,
    });
    if (!response.ok)
      throw new SystemFailureException(
        `Failed to save media: ${response.statusText}`,
      );
    return url; // note: returns the relative path in case of relative saving!
    // this is important for saving the relative paths elsewhere like the db.
  }

  /**
   * This function deletes a piece of media from storage
   * @param url is the url you want to delete the media from
   * note: this is the production impl and thus will call from the url.
   * @throws SystemFailureException if something went wrong trying to delete the media. (500)
   * note: normally and elsewhere in this project we don't throw errors when deleting,
   * however this is a special case, and we need to make sure the media filesystem's integrity stays intact.
   */
  async deleteMedia(url: string): Promise<void> {
    const newUrl = this.getFormattedUrl(url);
    const response = await fetch(newUrl, { method: "DELETE" });
    if (!response.ok)
      throw new SystemFailureException(
        `Failed to delete media: ${response.statusText}`,
      );
  }

  /**
   * Helper method for formatting the url for relative paths.
   * @param url is the url we want formatted
   * @returns the formatted url (absolute url tied strictly to mediaBase)
   */
  getFormattedUrl(url: string): string {
    let cleanPath = url;
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      try {
        const parsed = new URL(cleanPath);
        cleanPath = parsed.pathname; // Extracts just the "/folder/file.jpg" part
      } catch {
        // If it's a malformed URL, fallback to just removing the prefix roughly
        cleanPath = cleanPath.replace(/^https?:\/\/[^/]+/, "");
      }
    }

    cleanPath = cleanPath.replace(/^(\.\.(\/|\\|$))+/, "");

    const base = this.mediaBase.endsWith("/")
      ? this.mediaBase.slice(0, -1)
      : this.mediaBase;
    const path = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

    return `${base}${path}`;
  }
}
