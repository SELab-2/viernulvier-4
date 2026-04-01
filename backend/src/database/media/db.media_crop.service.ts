import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "../db.service";
import {
  CreateMediaCropDto,
  MediaCropDto,
  ModifyMediaCropDto,
  PaginationFilterDto,
  ReplaceMediaCropDto,
} from "../../dto/dto";
import { ResourceGoneException } from "../../common/exceptions";
import { PaginatedResponse } from "@repo/common";

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
}
