import { Injectable } from "@nestjs/common";
import { MediaStorage } from "./storage.interface";
import { LocalMediaStorage } from "./local_media_storage";
import { RemoteMediaStorage } from "./remote_media_storage";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MediaStorageService {
  private readonly storage: MediaStorage;

  constructor(private readonly configService: ConfigService) {
    this.storage =
      this.configService.get<string>("NODE_ENV") === "development" // this makes it important to run as npm run start:dev, will not work with npm run start:prod locally!!!
        ? new LocalMediaStorage(configService)
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
