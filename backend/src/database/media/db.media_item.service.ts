import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "../db.service";
import {
  CreateMediaItemDto,
  MediaCropDto,
  MediaItemDto,
  ModifyMediaItemDto,
  PaginationFilterDto,
  ReplaceMediaItemDto,
} from "../../dto/dto";
import { ResourceGoneException } from "../../common/exceptions";
import { PaginatedResponse } from "common/src/objects/pagination";

@Injectable()
export class MediaItemDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  // ----------------------------------------------------------------
  // Media Item
  // ----------------------------------------------------------------

  /**
   * Get a single media item by its ID.
   * @param id The ID we're trying to fetch.
   * @returns The MediaItem if there is one.
   */
  async getItemById(id: number): Promise<MediaItemDto> {
    const query = `
      SELECT id, type, original_filename, position, width, height, title, description, credits , created_at, updated_at
      FROM media_item
      WHERE id = $1
    `;

    const result = await this.db.query<MediaItemDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `No MediaItemDto exists for provided ID(${id})`,
      );
    }

    return result[0];
  }

  /**
   * Get all media items paginated.
   * @param paginationFilters The Filters regarding ordering and pagination.
   * @returns The MediaItems.
   */
  async getAllItems(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<MediaItemDto>> {
    const query = `
      SELECT * FROM media_item
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = `
      SELECT COUNT(DISTINCT id) as count
      FROM media_item;
    `;
    const offset = paginationFilters.page * paginationFilters.limit;

    const [objects, countResult] = await Promise.all([
      this.db.query<MediaItemDto>(query, [paginationFilters.limit, offset]),
      this.db.query<{ count: string }>(countQuery, []),
    ]);

    return {
      page: paginationFilters.page,
      limit: paginationFilters.limit,
      totalItems: parseInt(countResult[0].count),
      objects,
    };
  }

  /**
   * Create a new media item and link it to 1 or more gallery(s).
   * @param item Must be of type CreateMediaItemDto.
   * @param galleryIds a list of galleryIds you want to link this item to. (if left empty it will link to none)
   * @returns The created media item.
   */
  async createItem(
    item: CreateMediaItemDto,
    galleryIds: number[],
  ): Promise<MediaItemDto> {
    if (!item.type || !item.original_filename) {
      throw new BadRequestException("Missing required fields");
    }

    const insertQuery = `
        INSERT INTO media_item (type, original_filename, position, width, height, title, description, credits)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, type, original_filename, position, width, height, title, description, credits, created_at, updated_at
    `;

    const result = await this.db.query<MediaItemDto>(insertQuery, [
      item.type,
      item.original_filename,
      item.position ?? 0,
      item.width ?? null,
      item.height ?? null,
      item.title ?? null,
      item.description ?? null,
      item.credits ?? null,
    ]);

    if (result.length === 0) {
      throw new Error("Failed to create media item");
    }

    // link to a list of galleries
    if (galleryIds.length > 0) {
      for (const galleryId of galleryIds) {
        await this.db.query(
          `INSERT INTO gallery_item (gallery_id, item_id) VALUES ($1, $2)`,
          [galleryId, result[0].id],
        );
      }
    }

    return result[0];
  }

  /**
   * Update a media item by ID.
   * @param itemId The item to update.
   * @param item Fields to update, all optional.
   * @returns The updated media item.
   */
  async updateItem(
    itemId: number,
    item: ModifyMediaItemDto | ReplaceMediaItemDto,
  ): Promise<MediaItemDto> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (item.type !== undefined) {
      fields.push(`type = $${index++}`);
      values.push(item.type);
    }

    if (item.original_filename !== undefined) {
      fields.push(`original_filename = $${index++}`);
      values.push(item.original_filename);
    }

    if (item.position !== undefined) {
      fields.push(`position = $${index++}`);
      values.push(item.position);
    }

    if (item.width !== undefined) {
      fields.push(`width = $${index++}`);
      values.push(item.width);
    }

    if (item.height !== undefined) {
      fields.push(`height = $${index++}`);
      values.push(item.height);
    }

    if (item.title !== undefined) {
      fields.push(`title = $${index++}`);
      values.push(item.title);
    }

    if (item.description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(item.description);
    }

    if (item.credits !== undefined) {
      fields.push(`credits = $${index++}`);
      values.push(item.credits);
    }

    if (fields.length === 0) {
      throw new BadRequestException("No valid fields to update");
    }

    values.push(itemId);

    const query = `
      UPDATE media_item
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING id, type, original_filename, position, width, height, description, title, credits, created_at, updated_at
    `;

    const result = await this.db.query<MediaItemDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Failed to update media item with ID ${itemId}.`,
      );
    }

    return result[0];
  }

  /**
   * Delete a media item by ID. Silently does nothing if the ID doesn't exist.
   * @param id The item to delete.
   */
  async deleteItem(id: number): Promise<void> {
    const query = `DELETE FROM media_item WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [id]);
    if (result.length == 0) {
      throw new ResourceGoneException(`Cannot delete: Item ${id} not found`);
    }
  }

  //--------------------- crops: ------------------------//

  /**
   * Get all crops linked to a media item.
   * @param itemId The item to fetch crops for.
   * @returns List of crops for the given item.
   */
  async getCropsByItem(itemId: number): Promise<MediaCropDto[]> {
    const query = `
      SELECT mc.id, mc.name, mc.url, mc.created_at, mc.updated_at
      FROM media_crop mc
      INNER JOIN item_crop ic ON ic.crop_id = mc.id
      WHERE ic.item_id = $1
      ORDER BY mc.name
    `;

    return this.db.query<MediaCropDto>(query, [itemId]);
  }

  /**
   * Link an existing crop to an existing item.
   * Silently does nothing if the link already exists (ON CONFLICT DO NOTHING).
   * @param itemId The item to link to.
   * @param cropId The crop to link.
   */
  async linkCropToItem(itemId: number, cropId: number): Promise<void> {
    const query = `INSERT INTO item_crop (item_id, crop_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`;
    await this.db.query(query, [itemId, cropId]);
  }

  /**
   * Unlink a crop from an item. Does not delete the crop itself.
   * Silently does nothing if the link doesn't exist.
   * @param itemId The item to unlink from.
   * @param cropId The crop to unlink.
   */
  async unlinkCropFromItem(itemId: number, cropId: number): Promise<void> {
    const query = `DELETE FROM item_crop WHERE item_id = $1 AND crop_id = $2`;
    await this.db.query(query, [itemId, cropId]);
  }
}
