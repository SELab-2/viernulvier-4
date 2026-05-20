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
