import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { CreatePriceDto, PriceDto, UpdatePriceDto } from "../dto/dto";

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
    const query = `SELECT * price FROM prices WHERE id = $1`;

    const result = await this.db.query<PriceDto>(query, [id]);

    if (result.length === 0) {
      throw new Error("Price not found");
    }
    return result[0];
  }

  /**
   * Get prices with pagination
   * @param amount number of prices per page (if amount=0, it will default to grabbing all prices)
   * @param page page index (starts at 0)
   * @return prices
   */
  async getPrices(amount: number = 0, page: number = 0): Promise<PriceDto[]> {
    const offset = page * amount;

    if (amount === 0) {
      const query = `
      SELECT * 
      FROM prices
      ORDER BY id
      `;

      const result = await this.db.query<PriceDto>(query);

      return result;
    }

    const query = `
    SELECT * 
    FROM prices
    ORDER BY id 
    LIMIT $1 OFFSET $2
    `;

    const result = await this.db.query<PriceDto>(query, [amount, offset]);

    return result;
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
      INSERT INTO prices (
        name, price
      )
      VALUES ($1, $2)
      RETURNING id, name, price;
     `;

    const values = [price.name, price.price];

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
  async updatePrice(price: UpdatePriceDto): Promise<PriceDto> {
    if (!price.id) {
      throw new BadRequestException("Price id is required for update");
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (price.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(price.name);
    }
    if (price.price !== undefined) {
      fields.push(`price = $${index++}`);
      values.push(price.price);
    }

    if (fields.length === 0) {
      throw new BadRequestException("No valid fields to update");
    }

    values.push(price.id);

    // ignore error on "RETURNING", query is correct.
    const query = `
    UPDATE prices
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id, name, price;
    `;

    const result = await this.db.query<PriceDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to update price");
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
