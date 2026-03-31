import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreatePrintItemDto,
  PrintItemDto,
  ModifyPrintItemDto,
  PaginationFilterDto,
  ReplacePrintItemDto,
} from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";
import { PaginatedResponse } from "@repo/common/src/objects/pagination";

@Injectable()
export class PrintItemDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  // ----------------------------------------------------------------
  // Print Item
  // ----------------------------------------------------------------

  /**
   * Get a single print item by its ID.
   * @param id The ID we're trying to fetch.
   * @returns The PrintItem if there is one.
   */
  async getItemById(id: number): Promise<PrintItemDto> {
    const query = `
      SELECT id, titel, description, url, created_at, updated_at
      FROM print_item
      WHERE id = $1
    `;

    const result = await this.db.query<PrintItemDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `No PrintItemDto exists for provided ID(${id})`,
      );
    }

    return result[0];
  }

  /**
   * Get all print items paginated.
   * @param paginationFilters The Filters regarding ordering and pagination.
   * @returns The PrintItems.
   */
  async getAllItems(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<PrintItemDto>> {
    const query = `
        SELECT id, titel, description, url, created_at, updated_at
        FROM print_item
        ORDER BY id
        LIMIT $1 OFFSET $2;
    `;
    const countQuery = `
        SELECT COUNT(DISTINCT id) as count
        FROM print_item;
    `;

    const offset = paginationFilters.page * paginationFilters.limit;

    const [objects, countResult] = await Promise.all([
      this.db.query<PrintItemDto>(query, [paginationFilters.limit, offset]),
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
   * Create a new print item and link it to 1 or more gallery(s).
   * @param item Must be of type CreatePrintItemDto.
   * @param galleryIds a list of media_gallery_ids you want to link this item to. (if left emtpy it will link to none)
   * @returns The created PrintItem.
   */
  async createItem(
    item: CreatePrintItemDto,
    galleryIds: number[],
  ): Promise<PrintItemDto> {
    if (!item.url) {
        throw new BadRequestException("Missing required fields (url)");
    }
    const insertQuery = `
        INSERT INTO print_items (titel, description, url)
        VALUES ($1, $2, $3)
        RETURNING id, titel, description, url, created_at, updated_at;
    `;
    const result = await this.db.query<PrintItemDto>(insertQuery, [
      item.titel ?? null,
      item.description ?? null,
      item.url,
    ]);
    if (result.length === 0) {
        throw new Error("Failed to create PrintItem");
    }
    if (galleryIds && galleryIds.length > 0) {
        for (const galleryId of galleryIds) {
            await this.db.query(
                `INSERT INTO print_item_gallery (print_item_id, media_gallery_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [result[0].id, galleryId]
            );
        }
    }
    return result[0];
  }

  /**
   * Update a print item by ID.
   * @param itemId The item to update.
   * @param item Fields to update, all optional.
   * @returns The updated print item.
   */
  async updateItem(
    itemId: number,
    item: ModifyPrintItemDto | ReplacePrintItemDto,
    ): Promise<PrintItemDto> {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (item.titel !== undefined) {
            fields.push(`titel = $${index++}`);
            values.push(item.titel);
        }
        if (item.description !== undefined) {
            fields.push(`description = $${index++}`);
            values.push(item.description);
        }
        if (item.url !== undefined) {
            fields.push(`url = $${index++}`);
            values.push(item.url);
        }

        if (fields.length === 0) {
            throw new BadRequestException("No fields provided for update");
        }

        values.push(itemId);

        const query = `
            UPDATE print_items
            SET ${fields.join(", ")}
            WHERE id = $${index}
            RETURNING id, titel, description, url, created_at, updated_at;
        `;

        const result = await this.db.query<PrintItemDto>(query, values);

        if (result.length === 0) {
            throw new ResourceGoneException(
                `Failed to update print item with ID ${itemId}.`,
            );
        }
        return result[0];
    }

    /**
     * Delete a print item by ID. Silently does nothing if the ID doesn't exist.
     * @param id The item to delete.
     */
    async deleteItem(id: number): Promise<void> {
        const query = `DELETE FROM print_items WHERE id = $1 RETURNING id`;
        const result = await this.db.query(query, [id]);
        if (result.length == 0) {
            throw new ResourceGoneException(`Cannot delete: Print Item ${id} not found.`);
        }
    }
}