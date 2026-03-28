import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreateMediaCropDto,
  CreateMediaGalleryDto,
  CreateMediaItemDto,
  MediaCropDto,
  MediaGalleryDto,
  MediaItemDto,
  PaginationFilterDto,
  ModifyMediaCropDto,
  ModifyMediaItemDto,
  ReplaceMediaCropDto,
  ReplaceMediaItemDto,
} from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class MediaDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  // ----------------------------------------------------------------
  // Media Gallery
  // ----------------------------------------------------------------

  /**
   * Get a single gallery by its ID.
   * @param id The ID we're trying to fetch.
   * @returns The MediaGallery if there is one.
   */
  async getGalleryById(id: number): Promise<MediaGalleryDto> {
    const query = `
      SELECT id, created_at, updated_at
      FROM media_gallery
      WHERE id = $1
    `;

    const result = await this.db.query<MediaGalleryDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `No MediaGalleryDto exists for provided ID(${id})`,
      );
    }

    return result[0];
  }

  /**
   * Get galleries with pagination.
   * @param amount Number of galleries per page (0 = all).
   * @param page Page index (starts at 0).
   * @returns Paginated galleries.
   */
  async getGalleries(
    amount: number = 0,
    page: number = 0,
  ): Promise<PaginatedResponse<MediaGalleryDto>> {
    let query = `
      SELECT id, created_at, updated_at
      FROM media_gallery
      ORDER BY id
    `;

    const params: any[] = [];

    if (amount > 0) {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(amount, page * amount);
    }

    const [galleries, countResult] = await Promise.all([
      this.db.query<MediaGalleryDto>(query, params),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM media_gallery`,
      ),
    ]);

    return {
      page,
      limit: amount,
      totalItems: parseInt(countResult[0].count),
      objects: galleries,
    };
  }

  /**
   * Create a new gallery.
   * @param gallery Must be of type CreateMediaGalleryDto.
   * @returns The created gallery.
   */
  async createGallery(
    gallery: CreateMediaGalleryDto,
  ): Promise<MediaGalleryDto> {
    const query = `
      INSERT INTO media_gallery DEFAULT VALUES 
      RETURNING id, created_at, updated_at
    `;

    const result = await this.db.query<MediaGalleryDto>(query, [gallery.name]);

    if (result.length === 0) {
      throw new Error("Failed to create gallery");
    }

    return result[0];
  }

  // note: no update function for galleries seeing as there are no fields to be updated. (name has been removed)

  /**
   * Delete a gallery by ID. Silently does nothing if the ID doesn't exist.
   * @param id The gallery to delete.
   */
  async deleteGallery(id: number): Promise<void> {
    const query = `DELETE FROM media_gallery WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [id]);
    if (result.length == 0) {
      throw new ResourceGoneException(`Cannot delete: Gallery ${id} not found`);
    }
  }

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
   * Get all items belonging to a gallery.
   * @param galleryId The gallery to fetch items for.
   * @returns Ordered list of media items.
   */
  async getItemsByGallery(galleryId: number): Promise<MediaItemDto[]> {
    const query = `
      SELECT mi.id, mi.type, mi.original_filename, mi.position,
             mi.width, mi.height, mi.title, mi.description, mi.credits, mi.created_at, mi.updated_at
      FROM media_item mi
      INNER JOIN gallery_item gi ON gi.item_id = mi.id
      WHERE gi.gallery_id = $1
      ORDER BY mi.position
    `;

    return this.db.query<MediaItemDto>(query, [galleryId]);
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

  /**
   * Link an existing item to an existing gallery.
   * Silently does nothing if the link already exists (ON CONFLICT DO NOTHING).
   * @param galleryId The gallery to link to.
   * @param itemId The item to link.
   */
  async linkItemToGallery(galleryId: number, itemId: number): Promise<void> {
    const query = `INSERT INTO gallery_item (gallery_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`;
    await this.db.query(query, [galleryId, itemId]);
  }

  /**
   * Unlink an item from a gallery. Does not delete the item itself.
   * Silently does nothing if the link doesn't exist.
   * @param galleryId The gallery to unlink from.
   * @param itemId The item to unlink.
   */
  async unlinkItemFromGallery(
    galleryId: number,
    itemId: number,
  ): Promise<void> {
    const query = `DELETE FROM gallery_item WHERE gallery_id = $1 AND item_id = $2`;
    await this.db.query(query, [galleryId, itemId]);
  }

  // ----------------------------------------------------------------
  // Media Crop
  // ----------------------------------------------------------------

  /**
   * Get a single crop by its ID.
   * @param id The ID we're trying to fetch.
   * @returns The MediaCrop if there is one.
   */
  async getCropById(id: number): Promise<MediaCropDto> {
    const query = `
      SELECT id, name, url, created_at, updated_at
      FROM media_crop
      WHERE id = $1
    `;

    const result = await this.db.query<MediaCropDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `No MediaCropDto exists for provided ID(${id})`,
      );
    }

    return result[0];
  }

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

  // overkill but rather overkill than underkill
  /**
   * Get all media crops
   * @returns The MediaCrops.
   */
  async getAllCrops(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<MediaCropDto>> {
    const query = `
      SELECT * FROM media_crop
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = `
      SELECT COUNT(DISTINCT id) as count
      FROM media_crop;
    `;
    const offset = paginationFilters.page * paginationFilters.limit;

    const [objects, countResult] = await Promise.all([
      this.db.query<MediaCropDto>(query, [paginationFilters.limit, offset]),
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
   * Create a new crop and link it to a media item.
   * @param crop Must be of type CreateMediaCropDto.
   * (if left empty then it will not be linked to anything)
   * @returns The created crop.
   */
  async createCrop(crop: CreateMediaCropDto): Promise<MediaCropDto> {
    if (!crop.name || !crop.url) {
      throw new BadRequestException("Missing required fields");
    }

    const insertQuery = `
      INSERT INTO media_crop (name, url)
      VALUES ($1, $2)
      RETURNING id, name, url, created_at, updated_at
    `;

    const result = await this.db.query<MediaCropDto>(insertQuery, [
      crop.name,
      crop.url,
    ]);

    if (result.length === 0) {
      throw new Error("Failed to create media crop");
    }

    if (crop.item_id) {
      await this.db.query(
        `INSERT INTO item_crop (item_id, crop_id) VALUES ($1, $2)`,
        [crop.item_id, result[0].id],
      );
    }

    return result[0];
  }

  /**
   * Update a crop by ID.
   * @param cropId The crop to update.
   * @param crop Fields to update, all optional.
   * @returns The updated crop.
   */
  async updateCrop(
    cropId: number,
    crop: ModifyMediaCropDto | ReplaceMediaCropDto,
  ): Promise<MediaCropDto> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (crop.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(crop.name);
    }

    if (crop.url !== undefined) {
      fields.push(`url = $${index++}`);
      values.push(crop.url);
    }

    if (fields.length === 0) {
      throw new BadRequestException("No valid fields to update");
    }

    values.push(cropId);

    const query = `
      UPDATE media_crop
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING id, name, url, created_at, updated_at
    `;

    const result = await this.db.query<MediaCropDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Failed to update media crop with ID ${cropId}.`,
      );
    }

    return result[0];
  }

  /**
   * Delete a crop by ID. Silently does nothing if the ID doesn't exist.
   * @param id The crop to delete.
   */
  async deleteCrop(id: number): Promise<void> {
    const query = `DELETE FROM media_crop WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [id]);
    if (result.length == 0) {
      throw new ResourceGoneException(`Cannot delete: Crop ${id} not found`);
    }
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
