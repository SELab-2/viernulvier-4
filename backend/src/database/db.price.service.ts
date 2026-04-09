import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreatePriceDto,
  PriceDto,
  ModifyPriceDto,
  ReplacePriceDto,
  PaginationFilterDto,
} from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";
import { PaginatedResponse, PriceSchema } from "@repo/common";
import {
  generateCountQuery,
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";

@Injectable()
export class PriceDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single price by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The Price if there is one.
   */
  async getPriceById(id: number): Promise<PriceDto> {
    const returningClause = generateReturningClause(PriceSchema);

    const query = `
      SELECT ${returningClause}
      FROM prices 
      WHERE id = $1;
    `;

    const result = await this.db.query<PriceDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException(`Price with ID ${id} not found.`);
    }

    return result[0];
  }

  /**
   * Get prices with pagination
   * @param amount number of prices per page (if amount=0, it will default to grabbing all prices)
   * @param page page index (starts at 0)
   * @return prices
   */
  async getPrices(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<PriceDto>> {
    const returningClause = generateReturningClause(PriceSchema);

    const query = `
      SELECT ${returningClause}
      FROM prices
      ORDER BY id
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = generateCountQuery("prices");

    const offset = paginationFilters.page * paginationFilters.limit;

    const [prices, countResult] = await Promise.all([
      this.db.query<PriceDto>(query, [paginationFilters.limit, offset]),
      this.db.query<{ count: string }>(countQuery),
    ]);

    return {
      page: paginationFilters.page,
      limit: paginationFilters.limit,
      totalItems: parseInt(countResult[0].count),
      objects: prices,
    };
  }

  /**
   * Create price function, creates a price in the database with the given information.
   * @param price must be of the type "CreatePrice" which has all fields defined besides the primary key id.
   * @returns the added price if it was successful.
   */
  async createPrice(price: CreatePriceDto): Promise<PriceDto> {
    const { columns, placeholders, values } = generateInsertClause(price);
    const returningClause = generateReturningClause(PriceSchema);

    const query = `
      INSERT INTO prices (${columns})
      VALUES (${placeholders})
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<PriceDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create price.");
    }

    return result[0];
  }

  /**
   * Update function for price. Updates the price in the database.
   * @param price must be of the type "ModifyPrice" or "ReplacePrice", gives the freedom to define only what needs to be updated.
   * The id field in the price MUST be defined.
   * @returns the updated price if successful.
   */
  async updatePrice(
    priceId: number,
    price: ModifyPriceDto | ReplacePriceDto,
  ): Promise<PriceDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(price);
    const returningClause = generateReturningClause(PriceSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(priceId);

    const query = `
      UPDATE prices
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<PriceDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Failed to update price with ID ${priceId}.`,
      );
    }

    return result[0];
  }

  /**
   * Delete function for deleting prices from the database.
   * @param id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deletePrice(id: number): Promise<void> {
    const query = `DELETE FROM prices WHERE id = $1`;

    await this.db.query(query, [id]);
  }

  // insert extra functions here if desired.
}
