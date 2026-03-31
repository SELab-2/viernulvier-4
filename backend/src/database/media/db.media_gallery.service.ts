import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "../db.service";
import {
  CreateMediaGalleryDto,
  MediaGalleryDto,
  MediaItemDto,
  ModifyMediaGalleryDto,
  PrintItemDto,
  ReplaceMediaGalleryDto,
} from "../../dto/dto";
import { ResourceGoneException } from "../../common/exceptions";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class MediaGalleryDatabaseService {
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
      SELECT id, name, type, created_at, updated_at
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
      SELECT id, name, type, created_at, updated_at
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
   * Get all print items belonging to a media gallery.
   * @param galleryId The gallery to fetch print items for.
   * @returns List of print items.
   */
  async getPrintItemsByGallery(galleryId: number): Promise<PrintItemDto[]> {
    const query = `
      SELECT pi.id, pi.titel, pi.description, pi.url, pi.created_at, pi.updated_at
      FROM print_item pi
      INNER JOIN print_item_media_gallery pimg ON pimg.print_item_id = pi.id
      WHERE pimg.media_gallery_id = $1
    `;
    return this.db.query<PrintItemDto>(query, [galleryId]);
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
      RETURNING id, name, type, created_at, updated_at
    `;

    const result = await this.db.query<MediaGalleryDto>(query, [gallery.name]);

    if (result.length === 0) {
      throw new Error("Failed to create gallery");
    }

    return result[0];
  }

  /**
   * Updates a gallery
   * @param galleryId is the gallery you want to update
   * @param gallery Is the gallery object with the updates values
   * @returns the updates gallery
   */
  async updateGallery(
    galleryId: number,
    gallery: ModifyMediaGalleryDto | ReplaceMediaGalleryDto,
  ): Promise<MediaGalleryDto> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (gallery.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(gallery.name);
    }

    if (gallery.type !== undefined) {
      fields.push(`type = $${index++}`);
      values.push(gallery.type);
    }

    if (fields.length === 0) {
      throw new BadRequestException("No valid fields to update");
    }

    // Push the ID as the final value for the WHERE clause
    values.push(galleryId);

    const query = `
    UPDATE media_gallery
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id, created_at, updated_at, name, type
  `;

    const result = await this.db.query<MediaGalleryDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Failed to update media gallery with ID ${galleryId}.`,
      );
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

  //--------------------- items: ------------------------//

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
}
