import { BadRequestException, Injectable, NotFoundException, } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

interface MediaStorage {
  save(url: string, buffer: Buffer): Promise<string>;
  get(url: string): Promise<Buffer>;
  delete(url: string): Promise<void>;
}

/**
 * This handles all functionality in terms of media storage.
 */
class LocalMediaStorage implements MediaStorage {
  private readonly baseDir = path.join(process.cwd(), "../assets/media"); // dev assets folder
  private readonly baseUrl =
    process.env.MEDIA_BASE_URL ?? "http://127.0.0.1/photos"; //base url of the server hosting the media.

  /**
   * This function saves a piece of media to the media storage
   * @param url is the url where you want to save it (including the base url)
   * @param buffer is the photo data
   * @returns the url if successful
   * note: this is the dev impl and will save to the assets/media folder instead.
   */
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
  async delete(url: string): Promise<void> {
    const filePath = path.join(this.baseDir, url.replace(this.baseUrl, ""));
    if (!fs.existsSync(filePath))
      throw new NotFoundException(`Media not found: ${url}`);
    fs.unlinkSync(filePath);
  }
}

class RemoteMediaStorage implements MediaStorage {
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

@Injectable()
export class MediaStorageService {
  private readonly storage: MediaStorage;

  constructor() {
    this.storage =
      process.env.NODE_ENV === "development" // this makes it important to run as npm run start:dev, will not work with npm run start:prod locally!!!
        ? new LocalMediaStorage()
        : new RemoteMediaStorage();
  }

  /**
   * This function saves a piece of media to the media storage
   * @param url is the url where you want to save it (including the base url)
   * @param buffer is the photo data
   * @returns the url if successful
   * note: when working on dev env, this will auto-strip the base-url from the prod env,
   * and add write from the dirs onwards to the assets/media folder.
   * see GitHub docs for more details if anything is unclear.
   */
  saveMedia(url: string, buffer: Buffer): Promise<string> {
    return this.storage.save(url, buffer);
  }

  /**
   * This function gets a piece of media from the storage
   * @param url is the url (including base) you want to fetch the media from
   * @returns the media if it exists.
   * note: when working on dev env, this will auto-strip the base-url from the prod env,
   * and add fetch from the dirs onwards to the assets/media folder.
   * see GitHub docs for more details if anything is unclear.
   */
  getMedia(url: string): Promise<Buffer> {
    return this.storage.get(url);
  }

  /**
   * This function deletes a piece of media from storage
   * @param url is the url (including base) you want to delete the media from
   * note: when working on dev env, this will auto-strip the base-url from the prod env,
   * and delete from the dirs onwards to the assets/media folder.
   * see GitHub docs for more details if anything is unclear.
   */
  deleteMedia(url: string): Promise<void> {
    return this.storage.delete(url);
  }
}
