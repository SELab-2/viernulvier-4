import { Injectable } from "@nestjs/common";
import { MediaDatabaseService } from "../../database/db.media.service";
import { PaginatedResponse, PaginationFilter } from "@repo/common";
import {
  CreateMediaGalleryDto,
  MediaGalleryDto,
  MediaItemDto,
} from "../../dto/dto";

/**
 * Defines the connections between controller and database for
 * media gallery related actions.
 */
@Injectable()
export class MediaGalleryService {
  constructor(private readonly mediaDbService: MediaDatabaseService) {}

  /**
   * Fetches a page of all galleries from the database service.
   * @param paginationFilter The filters for what page and amount to fetch.
   * @returns The PaginatedResponse containing the galleries.
   */
  async getGalleries(
    paginationFilter: PaginationFilter,
  ): Promise<PaginatedResponse<MediaGalleryDto>> {
    return await this.mediaDbService.getGalleries(
      paginationFilter.limit,
      paginationFilter.page,
    );
  }

  /**
   * Fetches one single gallery by it's id from the database service.
   * @param id The ID of the gallery we want to fetch.
   * @returns The gallery that was fetched if it exists.
   */
  async getGalleryById(id: number): Promise<MediaGalleryDto> {
    return await this.mediaDbService.getGalleryById(id);
  }

  /**
   * Creates a new media gallery object.
   * @param createGallery The object we want to create in the database.
   * @returns The newly created gallery object.
   */
  async createGallery(
    createGallery: CreateMediaGalleryDto,
  ): Promise<MediaGalleryDto> {
    return await this.mediaDbService.createGallery(createGallery);
  }

  /**
   * Removes a single gallery from the database.
   * @param galleryId The ID of the gallery we want to remove.
   */
  async deleteGallery(galleryId: number): Promise<void> {
    await this.mediaDbService.deleteGallery(galleryId);
  }

  /**
   * Gallery -- Item
   */

  /**
   * Fetches a list of media items linked to the gallery provided.
   * @param galleryId The ID of the gallery we want to fetch items for.
   * @returns A list of media items.
   */
  async getGalleryItems(galleryId: number): Promise<MediaItemDto[]> {
    return await this.mediaDbService.getItemsByGallery(galleryId);
  }

  /**
   * Links an existing item to a gallery with the ids provided.
   * @param galleryId The ID of the media gallery.
   * @param itemId The ID of the media item.
   */
  async linkItemToGallery(galleryId: number, itemId: number): Promise<void> {
    await this.mediaDbService.linkItemToGallery(galleryId, itemId);
  }

  /**
   * Unlinks an existing item from an existing gallery.
   * @param galleryId The ID of the gallery.
   * @param itemId The ID of the item.
   */
  async unlinkItemFromGallery(
    galleryId: number,
    itemId: number,
  ): Promise<void> {
    await this.mediaDbService.unlinkItemFromGallery(galleryId, itemId);
  }
}
