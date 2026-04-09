import { Injectable } from "@nestjs/common";
import { PaginatedResponse, PaginationFilter } from "@repo/common";
import {
  CreateMediaGalleryDto,
  MediaGalleryDto,
  MediaItemDto,
  ModifyMediaGalleryDto,
  PrintItemDto,
  ReplaceMediaGalleryDto,
} from "../../dto/dto";
import { MediaGalleryDatabaseService } from "../../database/media/db.media_gallery.service";

/**
 * Defines the connections between controller and database for
 * media gallery related actions.
 */
@Injectable()
export class MediaGalleryService {
  constructor(private readonly mediaDbService: MediaGalleryDatabaseService) {}

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
   * Updates a media gallery object.
   * @param galleryId is the gallery we want to update.
   * @param gallery is the object with the updates values.
   * @returns The updated gallery.
   */
  async updateGallery(
    galleryId: number,
    gallery: ModifyMediaGalleryDto | ReplaceMediaGalleryDto,
  ): Promise<MediaGalleryDto> {
    return await this.mediaDbService.updateGallery(galleryId, gallery);
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
  async getGalleryItems(galleryId: number): Promise<MediaItemDto[] | PrintItemDto[]> {
    const gallery = await this.mediaDbService.getGalleryById(galleryId);
    if (gallery.type === "prints") {
      return await this.mediaDbService.getPrintItemsByGallery(galleryId);
    } else {
      return await this.mediaDbService.getItemsByGallery(galleryId);
    }
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

    /**
   * Links a print item to a media gallery.
   * @param printItemId The ID of the print item.
   * @param galleryId The ID of the media gallery.
   */
  async linkPrintItemToGallery(
    printItemId: number,
    galleryId: number,
  ): Promise<void> {
    await this.mediaDbService.linkPrintItemToGallery(
      galleryId,
      printItemId,
    );
  }

  /**
   * Unlinks a print item from a media gallery.
   * @param printItemId The ID of the print item.
   * @param galleryId The ID of the media gallery.
   */
  async unlinkPrintItemFromGallery(
    printItemId: number,
    galleryId: number,
  ): Promise<void> {
    await this.mediaDbService.unlinkPrintItemFromGallery(
      galleryId,
      printItemId,
    );
  }
}
