import { BadRequestException, NotFoundException } from "@nestjs/common";
import { MediaStorage } from "./storage.interface";

export class RemoteMediaStorage implements MediaStorage {
  /**
   * This function saves a piece of media to the media storage
   * @param url is the url where you want to save it (including the base url)
   * @param buffer is the photo data
   * @returns the url if successful
   * note: this is the production impl and thus will save to the given url.
   */
  async save(url: string, buffer: Buffer): Promise<string> {
    const response = await fetch(url, {
      method: "PUT",
      body: buffer.buffer as ArrayBuffer,
    });
    if (!response.ok)
      throw new BadRequestException(
        `Failed to save media: ${response.statusText}`,
      );
    return url;
  }

  /**
   * This function gets a piece of media from the storage
   * @param url is the url (including base) you want to fetch the media from
   * @returns the media if it exists.
   * note: this is the production impl and thus will call the url itself.
   */
  async get(url: string): Promise<Buffer> {
    const response = await fetch(url);
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
   * @param url is the url (including base) you want to delete the media from
   * note: this is the production impl and thus will call from the url.
   */
  async delete(url: string): Promise<void> {
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok)
      throw new Error(`Failed to delete media: ${response.statusText}`);
  }
}
