import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "../db.service";
import {
  CreateMediaGalleryDto,
  MediaGalleryDto,
  MediaItemDto,
  ModifyMediaGalleryDto,
  PaginationFilterDto,
  PrintItemDto,
  ReplaceMediaGalleryDto,
} from "../../dto/dto";
import { ResourceGoneException } from "../../common/exceptions";
import {
  MediaGallerySchema,
  MediaItemSchema,
  PaginatedResponse,
  PrintItemSchema,
} from "@repo/common";
import {
  generateCountQuery,
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "../db-utils";

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
    const returningClause = generateReturningClause(MediaGallerySchema);

    const query = `
      SELECT ${returningClause}
      FROM media_gallery
      WHERE id = $1;
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
    paginationFilter: PaginationFilterDto,
  ): Promise<PaginatedResponse<MediaGalleryDto>> {
    const returningClause = generateReturningClause(MediaGallerySchema);

    const query = `
      SELECT ${returningClause}
      FROM media_gallery
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = generateCountQuery("media_gallery");

    const offset = paginationFilter.page * paginationFilter.limit;

    const [galleries, countResult] = await Promise.all([
      this.db.query<MediaGalleryDto>(query, [paginationFilter.limit, offset]),
      this.db.query<{ count: string }>(countQuery, []),
    ]);

    return {
      page: paginationFilter.page,
      limit: paginationFilter.limit,
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
    const { columns, placeholders, values } = generateInsertClause(gallery);
    const returningClause = generateReturningClause(MediaGallerySchema);

    const query = `
      INSERT INTO media_gallery (${columns})
      VALUES (${placeholders}) 
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<MediaGalleryDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create gallery.");
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
    const { setClause, values, nextIndex } = generateUpdateClause(gallery);
    const returningClause = generateReturningClause(MediaGallerySchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    // Push the ID as the final value for the WHERE clause
    values.push(galleryId);

    const query = `
    UPDATE media_gallery
    SET ${setClause}
    WHERE id = $${nextIndex}
    RETURNING ${returningClause};
  `;

    const result = await this.db.query<MediaGalleryDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Failed to update media gallery with ID ${galleryId}.`,
      );
    }

    return result[0];
  }

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
    const mediaPrefix = "mi";
    const returningClause = generateReturningClause(
      MediaItemSchema,
      mediaPrefix,
    );

    const query = `
      SELECT ${returningClause}
      FROM media_item ${mediaPrefix}
      INNER JOIN gallery_item gi ON gi.item_id = ${mediaPrefix}.id
      WHERE gi.gallery_id = $1
      ORDER BY ${mediaPrefix}.position
    `;

    return await this.db.query<MediaItemDto>(query, [galleryId]);
  }

  /**
   * Get all print items belonging to a media gallery.
   * @param galleryId The gallery to fetch print items for.
   * @returns List of print items.
   */
  async getPrintItemsByGallery(galleryId: number): Promise<PrintItemDto[]> {
    const printPrefix = "pi";
    const returningClause = generateReturningClause(
      PrintItemSchema,
      printPrefix,
    );

    const query = `
      SELECT ${returningClause}
      FROM print_items ${printPrefix}
      INNER JOIN print_item_media_gallery pimg ON pimg.print_item_id = ${printPrefix}.id
      WHERE pimg.media_gallery_id = $1;
    `;
    return await this.db.query<PrintItemDto>(query, [galleryId]);
  }

  /**
   * Link an existing item to an existing gallery.
   * Silently does nothing if the link already exists (ON CONFLICT DO NOTHING).
   * @param galleryId The gallery to link to.
   * @param itemId The item to link.
   */
  async linkItemToGallery(galleryId: number, itemId: number): Promise<void> {
    const query = `
      INSERT INTO gallery_item (gallery_id, item_id) 
      VALUES ($1, $2) 
      ON CONFLICT DO NOTHING;
    `;
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
    const query = `
      DELETE FROM gallery_item 
      WHERE gallery_id = $1 AND item_id = $2;
    `;
    await this.db.query(query, [galleryId, itemId]);
  }

  /**
   * Link an existing print item to an existing gallery.
   * Silently does nothing if the link already exists (ON CONFLICT DO NOTHING).
   * @param galleryId The gallery to link to.
   * @param printItemId The print item to link.
   */
  async linkPrintItemToGallery(
    galleryId: number,
    printItemId: number,
  ): Promise<void> {
    const query = `
      INSERT INTO print_item_media_gallery (media_gallery_id, print_item_id) 
      VALUES ($1, $2) 
      ON CONFLICT DO NOTHING;
    `;
    await this.db.query(query, [galleryId, printItemId]);
  }

  /**
   * Unlink a print item from a gallery. Does not delete the print item itself.
   * Silently does nothing if the link doesn't exist.
   * @param galleryId The gallery to unlink from.
   * @param printItemId The print item to unlink.
   */
  async unlinkPrintItemFromGallery(
    galleryId: number,
    printItemId: number,
  ): Promise<void> {
    const query = `
      DELETE FROM print_item_media_gallery 
      WHERE media_gallery_id = $1 AND print_item_id = $2;
    `;
    await this.db.query(query, [galleryId, printItemId]);
  }
}
