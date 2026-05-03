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
import { PaginatedResponse } from "@repo/common/src/objects/pagination";
import {
  executeWithReferenceCheck,
  generateCountQuery,
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "../db-utils";
import { MediaCropSchema, MediaItemSchema } from "@repo/common";
import {
  ResourceNotFoundException,
  SystemFailureException,
} from "../../common/exceptions";

@Injectable()
export class MediaItemDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single media item by its ID.
   * @param id The ID we're trying to fetch.
   * @returns The MediaItem if there is one.
   * @throws ResourceNotFoundException if there is no item by the given id. (404)
   */
  async getItemById(id: number): Promise<MediaItemDto> {
    const returnClause = generateReturningClause(MediaItemSchema);

    const query = `
      SELECT ${returnClause}
      FROM media_item
      WHERE id = $1
    `;

    const result = await this.db.query<MediaItemDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceNotFoundException(MediaItemDto, id);
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
    const returningClause = generateReturningClause(MediaItemSchema);

    const query = `
      SELECT ${returningClause}
      FROM media_item
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = generateCountQuery("media_item");
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
   * @returns The created media item.
   * @throws SystemFailureException if something goes wrong while creating the object. (500)
   */
  async createItem(item: CreateMediaItemDto): Promise<MediaItemDto> {
    const { gallery_ids, ...itemData } = item;
    const { columns, placeholders, values, nextIndex } =
      generateInsertClause(itemData);
    const returningClause = generateReturningClause(MediaItemSchema);

    const insertAndLinkQuery = `
      WITH inserted_item AS (
        INSERT INTO media_item (${columns})
        VALUES (${placeholders})
        RETURNING ${returningClause}
      ),
      inserted_links AS (
        INSERT INTO gallery_item (gallery_id, item_id)
        SELECT UNNEST($${nextIndex}::int[]), id
        FROM inserted_item
      )
      SELECT * FROM inserted_item;
    `;

    // Push the gallery ids so they can be linked.
    values.push(gallery_ids || []);

    const result = await this.db.query<MediaItemDto>(
      insertAndLinkQuery,
      values,
    );

    if (result.length === 0) {
      throw new SystemFailureException("Failed to create media item");
    }

    return result[0];
  }

  /**
   * Update a media item by ID.
   * @param itemId The item to update.
   * @param item Fields to update, all optional.
   * @returns The updated media item.
   * @throws BadRequestException if no valid fields are provided to be updated. (400)
   * @throws ResourceNotFoundException if the given id is not linked to ant media item. (404)
   */
  async updateItem(
    itemId: number,
    item: ModifyMediaItemDto | ReplaceMediaItemDto,
  ): Promise<MediaItemDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(item);
    const returningClause = generateReturningClause(MediaItemSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(itemId);

    const query = `
      UPDATE media_item
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<MediaItemDto>(query, values);

    if (result.length === 0) {
      throw new ResourceNotFoundException(MediaItemDto, itemId);
    }

    return result[0];
  }

  /**
   * Delete a media item by ID. Silently does nothing if the ID doesn't exist.
   * @param id The item to delete.
   */
  async deleteItem(id: number): Promise<void> {
    const query = `DELETE FROM media_item WHERE id = $1 RETURNING id`;
    await this.db.query(query, [id]);
  }

  /**
   * Get all crops linked to a media item.
   * @param itemId The item to fetch crops for.
   * @returns List of crops for the given item.
   */
  async getCropsByItem(itemId: number): Promise<MediaCropDto[]> {
    const cropPrefix = "mc";
    const cropReturningClause = generateReturningClause(
      MediaCropSchema,
      cropPrefix,
    );

    const query = `
      SELECT ${cropReturningClause}
      FROM media_crop ${cropPrefix}
      INNER JOIN item_crop ic ON ic.crop_id = ${cropPrefix}.id
      WHERE ic.item_id = $1
      ORDER BY ${cropPrefix}.name
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

    await executeWithReferenceCheck(this.db.query(query, [itemId, cropId]));
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
