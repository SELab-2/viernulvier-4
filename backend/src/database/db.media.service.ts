import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreateMediaCropDto,
  CreateMediaGalleryDto,
  CreateMediaItemDto,
  MediaCropDto,
  MediaGalleryDto,
  MediaItemDto,
  UpdateMediaCropDto,
  UpdateMediaGalleryDto,
  UpdateMediaItemDto,
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
      SELECT id, legacy_id, name, created_at, updated_at
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
      SELECT id, legacy_id, name, created_at, updated_at
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
    if (!gallery.name) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO media_gallery (name, legacy_id)
      VALUES ($1, $2)
      RETURNING id, legacy_id, name, created_at, updated_at
    `;

    const result = await this.db.query<MediaGalleryDto>(query, [
      gallery.name,
      gallery.legacy_id ?? null,
    ]);

    if (result.length === 0) {
      throw new Error("Failed to create gallery");
    }

    return result[0];
  }

  /**
   * Update a gallery by ID.
   * @param galleryId The gallery to update.
   * @param gallery Fields to update, all optional.
   * @returns The updated gallery.
   */
  async updateGallery(
    galleryId: number,
    gallery: UpdateMediaGalleryDto,
  ): Promise<MediaGalleryDto> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (gallery.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(gallery.name);
    }

    if (gallery.legacy_id !== undefined) {
      fields.push(`legacy_id = $${index++}`);
      values.push(gallery.legacy_id);
    }

    if (fields.length === 0) {
      throw new BadRequestException("No valid fields to update");
    }

    values.push(galleryId);

    const query = `
      UPDATE media_gallery
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING id, legacy_id, name, created_at, updated_at
    `;

    const result = await this.db.query<MediaGalleryDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Failed to update gallery with ID ${galleryId}.`,
      );
    }

    return result[0];
  }

  /**
   * Delete a gallery by ID. Silently does nothing if the ID doesn't exist.
   * @param id The gallery to delete.
   */
  async deleteGallery(id: number): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM media_gallery WHERE id = $1 RETURNING id`,
      [id],
    );
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
      SELECT id, legacy_id, type, original_filename, position, width, height, format, created_at, updated_at
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
   * Get all items belonging to a gallery.
   * @param galleryId The gallery to fetch items for.
   * @returns Ordered list of media items.
   */
  async getItemsByGallery(galleryId: number): Promise<MediaItemDto[]> {
    const query = `
      SELECT mi.id, mi.legacy_id, mi.type, mi.original_filename, mi.position,
             mi.width, mi.height, mi.format, mi.created_at, mi.updated_at
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
        INSERT INTO media_item (legacy_id, type, original_filename, position, width, height, format)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, legacy_id, type, original_filename, position, width, height, format, created_at, updated_at
    `;

    const result = await this.db.query<MediaItemDto>(insertQuery, [
      item.legacy_id ?? null,
      item.type,
      item.original_filename,
      item.position ?? 0,
      item.width ?? null,
      item.height ?? null,
      item.format ?? null,
    ]);

    if (result.length === 0) {
      throw new Error("Failed to create media item");
    }

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
    item: UpdateMediaItemDto,
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

    if (item.format !== undefined) {
      fields.push(`format = $${index++}`);
      values.push(item.format);
    }

    if (fields.length === 0) {
      throw new BadRequestException("No valid fields to update");
    }

    values.push(itemId);

    const query = `
      UPDATE media_item
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING id, legacy_id, type, original_filename, position, width, height, format, created_at, updated_at
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
    const result = await this.db.query(
      `DELETE FROM media_item WHERE id = $1 RETURNING id`,
      [id],
    );
    if (result.length == 0) {
      throw new ResourceGoneException(`Cannot delete: Item ${id} not found`);
    }
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
      SELECT id, legacy_id, name, url, created_at, updated_at
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
      SELECT mc.id, mc.legacy_id, mc.name, mc.url, mc.created_at, mc.updated_at
      FROM media_crop mc
      INNER JOIN item_crop ic ON ic.crop_id = mc.id
      WHERE ic.item_id = $1
      ORDER BY mc.name
    `;

    return this.db.query<MediaCropDto>(query, [itemId]);
  }

  /**
   * Create a new crop and link it to 1 or more media item(s).
   * @param crop Must be of type CreateMediaCropDto.
   * @param itemIds The items to link this crop to.
   * (if left empty then it will not be linked to anything)
   * @returns The created crop.
   */
  async createCrop(
    crop: CreateMediaCropDto,
    itemIds: number[],
  ): Promise<MediaCropDto> {
    if (!crop.name || !crop.url) {
      throw new BadRequestException("Missing required fields");
    }

    const insertQuery = `
        INSERT INTO media_crop (legacy_id, name, url)
        VALUES ($1, $2, $3)
        RETURNING id, legacy_id, name, url, created_at, updated_at
    `;

    const result = await this.db.query<MediaCropDto>(insertQuery, [
      crop.legacy_id ?? null,
      crop.name,
      crop.url,
    ]);

    if (result.length === 0) {
      throw new Error("Failed to create media crop");
    }

    if (itemIds.length > 0) {
      for (const itemId of itemIds) {
        await this.db.query(
          `INSERT INTO item_crop (item_id, crop_id) VALUES ($1, $2)`,
          [itemId, result[0].id],
        );
      }
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
    crop: UpdateMediaCropDto,
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
      RETURNING id, legacy_id, name, url, created_at, updated_at
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
    const result = await this.db.query(
      `DELETE FROM media_crop WHERE id = $1 RETURNING id`,
      [id],
    );
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
    await this.db.query(
      `INSERT INTO item_crop (item_id, crop_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [itemId, cropId],
    );
  }

  /**
   * Unlink a crop from an item. Does not delete the crop itself.
   * Silently does nothing if the link doesn't exist.
   * @param itemId The item to unlink from.
   * @param cropId The crop to unlink.
   */
  async unlinkCropFromItem(itemId: number, cropId: number): Promise<void> {
    await this.db.query(
      `DELETE FROM item_crop WHERE item_id = $1 AND crop_id = $2`,
      [itemId, cropId],
    );
  }
}
