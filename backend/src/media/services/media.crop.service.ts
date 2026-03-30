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
import { createHash } from "node:crypto";
import path from "node:path";
import { MediaStorageService } from "../media_storage/media_storage.service";

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
   * @param autoDownload Whether to automatically fetch and save the physical file. Defaults to true.
   * @returns The newly created crop.
   */
  async createCrop(
    createCrop: CreateMediaCropDto,
    autoDownload: boolean = true,
  ): Promise<MediaCropDto> {
    let finalUrl = createCrop.url;

    // Only attempt download if it's an external HTTP URL
    if (
      autoDownload &&
      finalUrl.startsWith("http") &&
      !finalUrl.startsWith(this.baseUrl)
    ) {
      try {
        const response = await fetch(finalUrl);

        const buffer = Buffer.from(await response.arrayBuffer());

        // 1. Generate an MD5 hash of the actual file contents (the pixels)
        const fileHash = createHash("md5").update(buffer).digest("hex");

        // 2. Extract the file extension from the external URL (fallback to .jpg)
        const parsedUrl = new URL(finalUrl);
        const ext = path.extname(parsedUrl.pathname) || ".jpg";

        // 3. Construct the ultimate, collision-proof file name
        // Result looks like: "42-thumbnail-a94a8fe5ccb19ba61c4c0873d391e987.jpg"
        const newFileName = `${createCrop.item_id}-${createCrop.name}-${fileHash}${ext}`;

        // 4. Construct the clean URL for your system
        finalUrl = `${this.baseUrl}/photos/${newFileName}`;

        // 5. Save the physical file using your storage service
        await this.mediaStorageService.saveMedia(finalUrl, buffer);
      } catch (error) {
        throw new BadRequestException(
          `Could not process media URL: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Override the URL in the payload with our new local URL
    const cropToSave = {
      ...createCrop,
      url: finalUrl,
    };

    // Save the record to the database
    return await this.mediaDbService.createCrop(cropToSave);
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
