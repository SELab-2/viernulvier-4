import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreatePrintItemDto,
  PrintItemDto,
  ModifyPrintItemDto,
  PaginationFilterDto,
  ReplacePrintItemDto,
  FilterPrintItemDto,
} from "../dto/dto";
import { PaginatedResponse } from "@repo/common/src/objects/pagination";
import {
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";
import { PrintItemSchema, SUPPORTED_LANGUAGES } from "@repo/common";
import { ResourceNotFoundException } from "../common/exceptions";

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
      throw new ResourceNotFoundException(PrintItemDto, id);
    }

    return result[0];
  }

  /**
   * Get all print items paginated.
   * @param paginationFilters The Filters regarding ordering and pagination.
   * @param printItemFilters The filters for the prints.
   * @returns The PrintItems.
   */
  async getAllPrintItems(
    paginationFilters: PaginationFilterDto,
    printItemFilters: FilterPrintItemDto,
  ): Promise<PaginatedResponse<PrintItemDto>> {
    const returningClause = generateReturningClause(PrintItemSchema);

    const conditions: string[] = [];
    const values: any[] = [];
    const param = (val: any) => {
      values.push(val);
      return `$${values.length}`;
    };

    // Title filter
    // NOTE: This is case-insensitive and looks in all languages + matches on parts.
    if (printItemFilters.title) {
      const titleParam = param(`%${printItemFilters.title}%`);
      const titelClauses = SUPPORTED_LANGUAGES.map(
        (lang) => `titel->>'${lang}' ILIKE ${titleParam}`,
      );
      conditions.push(`(${titelClauses.join(" OR ")})`);
    }

    // Filter for prints of a certain type
    if (printItemFilters.type) {
      conditions.push(`print_type = ${param(printItemFilters.type)}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const filterValues = [...values];
    const countQuery = `
      SELECT COUNT(*) as count FROM print_items
      ${whereClause};
    `;

    // pagination
    const offset = paginationFilters.page * paginationFilters.limit;
    const paginationClause = `LIMIT ${param(paginationFilters.limit)} OFFSET ${param(offset)}`;

    const query = `
      SELECT ${returningClause}
      FROM print_items
      ${whereClause}
      ORDER BY created_at ${paginationFilters.descending ? "DESC" : "ASC"}
      ${paginationClause};
    `;
    const [objects, countResult] = await Promise.all([
      this.db.query<PrintItemDto>(query, values),
      this.db.query<{ count: string }>(countQuery, filterValues),
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
      throw new ResourceNotFoundException(PrintItemDto, itemId);
    }
    return result[0];
  }

  /**
   * Delete a print item by ID. Silently does nothing if the ID doesn't exist.
   * @param id The item to delete.
   */
  async deletePrintItem(id: number): Promise<void> {
    const query = `DELETE FROM print_items WHERE id = $1 RETURNING id`;

    // * NOTE: We don't check for failures here for idempotency.
    await this.db.query(query, [id]);
  }
}
