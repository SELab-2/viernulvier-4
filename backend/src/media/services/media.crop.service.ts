import { BadRequestException, Injectable } from "@nestjs/common";
import { MediaDatabaseService } from "../../database/db.media.service";
import { PaginatedResponse } from "@repo/common";
import {
  CreateMediaCropDto,
  MediaCropDto,
  ModifyMediaCropDto,
  PaginationFilterDto,
  ReplaceMediaCropDto,
} from "../../dto/dto";
import path from "node:path";
import { MediaStorageService } from "../media_storage/service/media_storage.service";

/**
 * Defines the connection between controller and database service
 * for media crops.
 */
@Injectable()
export class MediaCropService {
  private readonly baseUrl = (
    process.env.MEDIA_BASE_URL ?? "http://127.0.0.1"
  ).replace(/\/$/, "");

  constructor(
    private readonly mediaDbService: MediaDatabaseService,
    private readonly mediaStorageService: MediaStorageService,
  ) {}

  /**
   * Fetches a paginated list of crops.
   * @param paginationFilters The Filters for pagination and ordering.
   * @returns The paginated list of media crops.
   */
  async getCrops(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<MediaCropDto>> {
    return await this.mediaDbService.getAllCrops(paginationFilters);
  }

  /**
   * Fetches one single media crop from the database.
   * @param cropId The ID of the crop.
   * @returns The crop corresponding to the id.
   */
  async getCropById(cropId: number): Promise<MediaCropDto> {
    return await this.mediaDbService.getCropById(cropId);
  }

  /**
   * Creates a new media crop.
   * @param createCrop The crop to create.
   * @param autoDownload Whether to automatically fetch and save the physical file. Defaults to false.
   * @returns The newly created (and potentially updated) crop.
   */
  async createCrop(
    createCrop: CreateMediaCropDto,
    autoDownload: boolean = false,
  ): Promise<MediaCropDto> {
    // first save the crop in the db -> need it for its id.
    let savedCrop = await this.mediaDbService.createCrop(createCrop);

    // if we want to download it: download the photo, give it a new url and update that url in the db.
    if (
      autoDownload &&
      createCrop.url.startsWith("http") &&
      !createCrop.url.startsWith(this.baseUrl)
    ) {
      try {
        // fetch the photo
        const response = await fetch(createCrop.url);
        const buffer = Buffer.from(await response.arrayBuffer());

        // concat new url.
        const parsedUrl = new URL(createCrop.url);
        const ext = path.extname(parsedUrl.pathname) || ".jpg";
        const newFileName = `${savedCrop.id}${ext}`;
        const finalUrl = `${this.baseUrl}/photos/${newFileName}`;

        // save the photo + update the db.
        await this.mediaStorageService.saveMedia(finalUrl, buffer);
        savedCrop = await this.mediaDbService.updateCrop(savedCrop.id, {
          url: finalUrl,
        });
      } catch (error) {
        // Note: If this fails, the DB record still exists but retains the external URL.
        // in this case it is important to know that you will most likely have to manually download and update if you wish to try.
        throw new BadRequestException(
          `Could not process media URL: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return savedCrop;
  }

  /**
   * Replaces an existing media crop.
   * @param cropId The ID of the crop we want to replace.
   * @param replaceCrop The crop that will be put in that place.
   * @returns The newly replaced crop.
   */
  async replaceCrop(
    cropId: number,
    replaceCrop: ReplaceMediaCropDto,
  ): Promise<MediaCropDto> {
    return await this.mediaDbService.updateCrop(cropId, replaceCrop);
  }

  /**
   * Modifies an existing media crop partially.
   * @param cropId The ID if the crop.
   * @param modifyCrop The partial object we want to update it with.
   * @returns The modified crop.
   */
  async modifyCrop(
    cropId: number,
    modifyCrop: ModifyMediaCropDto,
  ): Promise<MediaCropDto> {
    const existingCrop: MediaCropDto =
      await this.mediaDbService.getCropById(cropId);

    const mergedCrop: MediaCropDto = {
      ...existingCrop,
      ...modifyCrop,
      id: cropId,
    };

    return await this.mediaDbService.updateCrop(cropId, mergedCrop);
  }

  /**
   * Deletes an existing crop.
   * @param cropId The ID of the crop we want to delete.
   */
  async deleteCrop(cropId: number): Promise<void> {
    await this.mediaDbService.deleteCrop(cropId);
  }
}
