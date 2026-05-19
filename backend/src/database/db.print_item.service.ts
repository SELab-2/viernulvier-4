import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreatePrintItemDto,
  FilterPrintItemDto,
  ModifyPrintItemDto,
  PaginationFilterDto,
  PrintItemDto,
  ReplacePrintItemDto,
} from "../dto/dto";
import { PaginatedResponse } from "@repo/common/src/objects/pagination";
import {
  generateInsertClause,
  generateRelevanceClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";
import { Language, PrintItemSchema, SUPPORTED_LANGUAGES } from "@repo/common";
import {
  ResourceNotFoundException,
  SystemFailureException,
} from "../common/exceptions";

@Injectable()
export class PrintItemDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single print item by its ID.
   * @param id The ID we're trying to fetch.
   * @returns The PrintItem if there is one.
   * @throws ResourceNotFoundException if there is no printitem with the provided id. (404)
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
   * @param language Optional language param used for ordering or searching text.
   * @returns The PrintItems.
   */
  async getAllPrintItems(
    paginationFilters: PaginationFilterDto,
    printItemFilters: FilterPrintItemDto,
    language?: Language,
  ): Promise<PaginatedResponse<PrintItemDto>> {
    const returningClause = generateReturningClause(PrintItemSchema);

    const conditions: string[] = [];
    const values: (string | number)[] = [];
    const param = (val: string | number) => {
      values.push(val);
      return `$${values.length}`;
    };

    // Title filter
    // Looks into the language provided and filters differently based on
    // Whether the query is a suggestion or not.
    if (printItemFilters.title) {
      const searchTerm = printItemFilters.title;

      const allClauses = SUPPORTED_LANGUAGES.flatMap((lang) => {
        if (language && language !== lang) return [];

        const titleField = `titel->>'${lang}'`;

        if (printItemFilters.is_suggestion) {
          const pSearch = param(searchTerm);
          return [`word_similarity(${pSearch}, ${titleField}) > 0.3`];
        } else {
          const pSearch = param(`%${searchTerm}%`);
          return [`${titleField} ILIKE ${pSearch}`];
        }
      });

      // Push them as a single string wrapped in parentheses, joined by OR
      if (allClauses.length > 0) {
        conditions.push(`(${allClauses.join(" OR ")})`);
      }
    }

    // Filter for prints of a certain type
    if (printItemFilters.type) {
      conditions.push(`print_type = ${param(printItemFilters.type)}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const filterValues = [...values];
    const countQuery = `
      SELECT COUNT(*) as count FROM print_items
      ${whereClause};
    `;

    // pagination
    const offset = paginationFilters.page * paginationFilters.limit;
    const paginationClause = `LIMIT ${param(paginationFilters.limit)} OFFSET ${param(offset)}`;

    // Ordering (relevance vs date)
    let orderClause: string;
    if (printItemFilters.is_suggestion && printItemFilters.title) {
      const relevanceMath = generateRelevanceClause(
        printItemFilters.title,
        [{ name: `titel` }],
        param,
        language,
      );

      orderClause = `ORDER BY ${relevanceMath} DESC`;
    } else {
      orderClause = `ORDER BY created_at ${paginationFilters.descending ? "DESC" : "ASC"}`;
    }

    const query = `
      SELECT ${returningClause}
      FROM print_items
      ${whereClause}
      ${orderClause}
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
   * @throws SystemFailureException if something went wrong while creating the object. (500)
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
      throw new SystemFailureException("Failed to create PrintItem.");
    }

    return result[0];
  }

  /**
   * Update a print item by ID.
   * @param itemId The item to update.
   * @param item Fields to update, all optional.
   * @returns The updated print item.
   * @throws BadRequestException if there were no fields provided to be updated. (400)
   * @throws ResourceNotFoundException if the provided id is not linked with a print item. (404)
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
