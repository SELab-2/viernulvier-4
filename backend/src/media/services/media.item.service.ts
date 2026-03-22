import { Injectable } from "@nestjs/common";
import { MediaDatabaseService } from "../../database/db.media.service";
import { CreateMediaItemDto, MediaItemDto } from "../../dto/dto";

/**
 * Defines the connection between controller and database service
 * for media items.
 */
@Injectable()
export class MediaItemService {
  constructor(private readonly mediaDbService: MediaDatabaseService) {}

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
    replaceItem: MediaItemDto,
  ): Promise<MediaItemDto> {
    replaceItem.id = itemId; // Make sure the ID is correct.
    return await this.mediaDbService.updateItem(itemId, replaceItem);
  }
}
