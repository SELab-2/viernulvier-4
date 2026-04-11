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
import {
  generateCountQuery,
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";
import { PrintItemSchema } from "@repo/common";

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
  async getPrintItemById(id: number): Promise<PrintItemDto> {
    const returningClause = generateReturningClause(PrintItemSchema);

    const query = `
      SELECT ${returningClause}
      FROM print_items
      WHERE id = $1;
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
  async getAllPrintItems(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<PrintItemDto>> {
    const returningClause = generateReturningClause(PrintItemSchema);

    const query = `
      SELECT ${returningClause}
      FROM print_items
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = generateCountQuery("print_items");
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
   * @returns The created PrintItem.
   */
  async createPrintItem(item: CreatePrintItemDto): Promise<PrintItemDto> {
    const { gallery_ids, ...itemData } = item;
    const { columns, placeholders, values, nextIndex } =
      generateInsertClause(itemData);
    const returningClause = generateReturningClause(PrintItemSchema);

    const insertAndLinkQuery = `
      WITH inserted_item AS (
        INSERT INTO print_items (${columns})
        VALUES (${placeholders})
        RETURNING ${returningClause}
      ),
      inserted_links AS (
        INSERT INTO print_item_media_gallery (media_gallery_id, print_item_id)
        SELECT UNNEST($${nextIndex}::int[]), id
        FROM inserted_item
      )
      SELECT * FROM inserted_item;
    `;

    // Push the gallery ids so they can be linked.
    values.push(gallery_ids || []);

    const result = await this.db.query<PrintItemDto>(
      insertAndLinkQuery,
      values,
    );

    if (result.length === 0) {
      throw new BadRequestException("Failed to create PrintItem.");
    }

    return result[0];
  }

  /**
   * Update a print item by ID.
   * @param itemId The item to update.
   * @param item Fields to update, all optional.
   * @returns The updated print item.
   */
  async updatePrintItem(
    itemId: number,
    item: ModifyPrintItemDto | ReplacePrintItemDto,
  ): Promise<PrintItemDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(item);
    const returningClause = generateReturningClause(PrintItemSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(itemId);

    const query = `
      UPDATE print_items
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
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
  async deletePrintItem(id: number): Promise<void> {
    const query = `DELETE FROM print_items WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [id]);
    if (result.length == 0) {
      throw new ResourceGoneException(
        `Cannot delete: Print Item ${id} not found.`,
      );
    }
  }
}
