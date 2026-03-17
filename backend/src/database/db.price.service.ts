import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreatePriceDto,
  PaginatedPriceDto,
  PriceDto,
  UpdatePriceDto,
} from "../dto/dto";
import { ResourceGoneException } from "src/common/exceptions";

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
    const query = `SELECT id, 
       price, 
       name, 
       created_at, 
       updated_at, 
       legacy_id 
      FROM prices WHERE id = $1`;
    const result = await this.db.query<PriceDto>(query, [id]);

    return result[0];
  }

  /**
   * Get prices with pagination
   * @param amount number of prices per page (if amount=0, it will default to grabbing all prices)
   * @param page page index (starts at 0)
   * @return prices
   */
  async getPrices(
    amount: number = 0,
    page: number = 0,
  ): Promise<PaginatedPriceDto> {
    let query = `
    SELECT id, price, name, created_at, updated_at, legacy_id
    FROM prices
    ORDER BY id
  `;

    const params: any[] = [];

    if (amount > 0) {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(amount, page * amount);
    }

    const [prices, countResult] = await Promise.all([
      this.db.query<PriceDto>(query, params),
      this.db.query<{ count: string }>(`SELECT COUNT(*) as count FROM prices`),
    ]);

    return {
      page,
      limit: amount,
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
    if (!price.name || !price.price) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO prices (name, price, legacy_id)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        price,
        created_at,
        updated_at,
        legacy_id;
    `;

    const values = [JSON.stringify(price.name), price.price, price.legacy_id];

    const result = await this.db.query<PriceDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create price");
    }

    return result[0];
  }

  /**
   * Update function for price. Updates the price in the database.
   * @param price must be of the type "UpdatePrice", gives the freedom to define only what needs to be updated.
   * The id field in the price MUST be defined.
   * @returns the updated price if successful.
   */
  async updatePrice(priceId: number, price: UpdatePriceDto): Promise<PriceDto> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (price.name !== undefined) {
      fields.push(`name = COALESCE(name, '{}'::jsonb) || $${index++}::jsonb`);
      values.push(JSON.stringify(price.name));
    }

    if (price.price !== undefined) {
      fields.push(`price = $${index++}`);
      values.push(price.price);
    }

    if (fields.length === 0) {
      throw new BadRequestException("No valid fields to update");
    }

    values.push(priceId);

    const query = `
      UPDATE prices
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING
        id,
        name,
        price,
        created_at,
        updated_at,
        legacy_id;
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
