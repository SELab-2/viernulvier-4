import { Injectable } from "@nestjs/common";
import {
  CreateMediaItemDto,
  MediaCropDto,
  MediaItemDto,
  ModifyMediaItemDto,
  PaginationFilterDto,
  ReplaceMediaItemDto,
} from "../../dto/dto";
import { PaginatedResponse } from "@repo/common";
import { MediaItemDatabaseService } from "../../database/media/db.media_item.service";

/**
 * Defines the connection between controller and database service
 * for media items.
 */
@Injectable()
export class MediaItemService {
  constructor(private readonly mediaDbService: MediaItemDatabaseService) {}

  /**
   * Fetches all media items in paginated lists.
   * @param paginationFilters The pagination parameters.
   * @returns The Paginated list of media items.
   */
  async getItems(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<MediaItemDto>> {
    return await this.mediaDbService.getAllItems(paginationFilters);
  }

  /**
   * Fetches a single media item from the database.
   * @param itemId The ID of the media item.
   * @returns The fetched media item.
   */
  async getItemById(itemId: number): Promise<MediaItemDto> {
    return await this.mediaDbService.getItemById(itemId);
  }

  /**
   * Creates a media item and links it to the galleries that were provided.
   * @param createItem The object to create the item from.
   * @returns The newly created media item.
   */
  async createItem(createItem: CreateMediaItemDto): Promise<MediaItemDto> {
    return await this.mediaDbService.createItem(
      createItem,
      createItem.gallery_ids || [], // Could be empty so in case we just pass empty list.
    );
  }

  /**
   * Replaces an existing media item by a new one, keeping the ID.
   * @param itemId The ID of the Item.
   * @param replaceItem The item we want to replace the existing item with.
   * @returns The replaced item.
   */
  async replaceItem(
    itemId: number,
    replaceItem: ReplaceMediaItemDto,
  ): Promise<MediaItemDto> {
    return await this.mediaDbService.updateItem(itemId, replaceItem);
  }

  /**
   * Modifies an existing media item with partial data.
   * @param itemId The ID of the item.
   * @param modifyItem The partial object we want to modify to.
   * @returns The modified media item.
   */
  async modifyItem(
    itemId: number,
    modifyItem: ModifyMediaItemDto,
  ): Promise<MediaItemDto> {
    const existingItem: MediaItemDto =
      await this.mediaDbService.getItemById(itemId);

    const mergedItem: MediaItemDto = {
      ...existingItem,
      ...modifyItem,
      id: itemId,
    };

    return await this.mediaDbService.updateItem(itemId, mergedItem);
  }

  /**
   * Deletes a single media item.
   * @param itemId The ID of said item.
   */
  async deleteItem(itemId: number): Promise<void> {
    await this.mediaDbService.deleteItem(itemId);
  }

  /**
   * Item -- Crop
   */

  /**
   * Returns all crops for a media item.
   * @param itemId The ID of the media item.
   * @returns All of the crops for that item.
   */
  async getItemCrops(itemId: number): Promise<MediaCropDto[]> {
    return await this.mediaDbService.getCropsByItem(itemId);
  }

  /**
   * Links a crop to an item.
   * @param itemId The ID of the item.
   * @param cropId The ID of the crop.
   */
  async linkCropToItem(itemId: number, cropId: number): Promise<void> {
    await this.mediaDbService.linkCropToItem(itemId, cropId);
  }

  /**
   * Unlinks a crop from an item.
   * @param itemId The ID of the item.
   * @param cropId The ID of the crop.
   */
  async unlinkCropFromItem(itemId: number, cropId: number): Promise<void> {
    await this.mediaDbService.unlinkCropFromItem(itemId, cropId);
  }
}
