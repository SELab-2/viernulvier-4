import { Injectable } from "@nestjs/common";
import { PaginatedResponse } from "@repo/common";
import {
  CreateMediaCropDto,
  MediaCropDto,
  ModifyMediaCropDto,
  PaginationFilterDto,
  ReplaceMediaCropDto,
} from "../../dto/dto";
import { MediaCropDatabaseService } from "../../database/media/db.media_crop.service";

/**
 * Defines the connection between controller and database service
 * for media crops.
 */
@Injectable()
export class MediaCropService {
  constructor(private readonly mediaDbService: MediaCropDatabaseService) {}

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
   * @returns The newly created (and potentially updated) crop.
   */
  async createCrop(createCrop: CreateMediaCropDto): Promise<MediaCropDto> {
    return await this.mediaDbService.createCrop(createCrop);
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
