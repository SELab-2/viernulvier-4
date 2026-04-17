import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "../db.service";
import {
  CreateMediaCropDto,
  MediaCropDto,
  ModifyMediaCropDto,
  PaginationFilterDto,
  ReplaceMediaCropDto,
} from "../../dto/dto";
import { MediaCropSchema, PaginatedResponse } from "@repo/common";
import {
  generateCountQuery,
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "../db-utils";
import { ResourceNotFoundException } from "../../common/exceptions";

@Injectable()
export class MediaCropDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  // ----------------------------------------------------------------
  // Media Crop
  // ----------------------------------------------------------------

  /**
   * Get a single crop by its ID.
   * @param id The ID we're trying to fetch.
   * @returns The MediaCrop if there is one.
   */
  async getCropById(id: number): Promise<MediaCropDto> {
    const returningClause = generateReturningClause(MediaCropSchema);

    const query = `
      SELECT ${returningClause}
      FROM media_crop
      WHERE id = $1;
    `;

    const result = await this.db.query<MediaCropDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceNotFoundException(MediaCropDto, id);
    }

    return result[0];
  }

  /**
   * Get all media crops
   * @returns The MediaCrops.
   */
  async getAllCrops(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<MediaCropDto>> {
    const returningClause = generateReturningClause(MediaCropSchema);

    const query = `
      SELECT ${returningClause}
      FROM media_crop
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = generateCountQuery("media_crop");
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
    const { item_id, ...cropData } = crop;

    const { columns, placeholders, values, nextIndex } =
      generateInsertClause(cropData);
    const returningClause = generateReturningClause(MediaCropSchema);

    // Push the item id so it can be used to link.
    values.push(item_id);

    const insertAndLinkQuery = `
      WITH inserted_crop AS (
        INSERT INTO media_crop (${columns})
        VALUES (${placeholders})
        RETURNING ${returningClause}
      ),
      inserted_link AS (
        INSERT INTO item_crop (item_id, crop_id)
        VALUES ($${nextIndex}, (SELECT id FROM inserted_crop))
      )
      SELECT * FROM inserted_crop;
    `;

    const result = await this.db.query<MediaCropDto>(
      insertAndLinkQuery,
      values,
    );

    // Throw BadRequest if creation failed.
    if (result.length === 0) {
      throw new BadRequestException("Failed to create media crop.");
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
    const { setClause, values, nextIndex } = generateUpdateClause(crop);
    const returningClause = generateReturningClause(MediaCropSchema);

    // Safety guard for empty updates.
    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    // Push the actual crop ID.
    values.push(cropId);

    const query = `
      UPDATE media_crop
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<MediaCropDto>(query, values);

    if (result.length === 0) {
      throw new ResourceNotFoundException(MediaCropDto, cropId);
    }

    return result[0];
  }

  /**
   * Delete a crop by ID. Silently does nothing if the ID doesn't exist.
   * @param id The crop to delete.
   */
  async deleteCrop(id: number): Promise<void> {
    const query = `DELETE FROM media_crop WHERE id = $1 RETURNING id`;

    // * NOTE: We don't check for failures here for idempotency.
    await this.db.query(query, [id]);
  }
}
