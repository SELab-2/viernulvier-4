import { Injectable } from "@nestjs/common";
import { vnvGenre, vnvLocation, vnvPrice } from "../vnv.parser";
import { Location, Price, Tag } from "@repo/common";
import { ScraperDbService } from "./scraper.db.service";

/**
 * This service handles insertion of the smaller objects.
 * They would be too small to put in their own service hinds why they are here.
 * here you will find the insertion for tags, locations & prices.
 */
@Injectable()
export class ScraperAttributesDbService {
  constructor(private db: ScraperDbService) {}

  /**
   * Inserts a list of vnvGenre objects into Tags.
   * @param genres The list of vnvGenre objects.
   */
  async insertTags(genres: vnvGenre[]) {
    await this.db.processInBatches("Tags", genres, 500, (g: vnvGenre) =>
      this.insertTag(g),
    );
  }

  /**
   * Inserts a list of vnvLocation objects.
   * @param locations The list of vnvLocation objects.
   */
  async insertLocations(locations: vnvLocation[]) {
    await this.db.processInBatches(
      "Locations",
      locations,
      500,
      (l: vnvLocation) => this.insertLocation(l),
    );
  }

  /**
   * Insert a list of vnvPrice objects.
   * @param prices The list of vnvPrice objects.
   */
  async insertPrices(prices: vnvPrice[]) {
    await this.db.processInBatches("Prices", prices, 500, (p: vnvPrice) =>
      this.insertPrice(p),
    );
  }

  /**
   * Inserts/Updates a single tag into the database based
   * on it's legacy_id.
   * @param genre The vnvGenre that is to be turned into a Tag.
   * @returns The ID of the Tag.
   */
  async insertTag(genre: vnvGenre): Promise<number> {
    const query = `
      INSERT INTO tags (tag, legacy_id)
      VALUES ($1, $2)
      ON CONFLICT (legacy_id)
        DO UPDATE SET tag = EXCLUDED.tag
      RETURNING *;
    `;
    const values = [genre.name, genre.legacy_id];
    const output: Tag[] = await this.db.query<Tag>(query, values);
    return output[0].id;
  }

  /**
   * Inserts a single vnvLocation into the database.
   * @param location The location we want inserted.
   * @returns Nothing.
   */
  async insertLocation(location: vnvLocation) {
    const query = `
      INSERT INTO locations (location, legacy_id)
      VALUES ($1, $2)
      ON CONFLICT (legacy_id)
        DO UPDATE SET location = EXCLUDED.location
      RETURNING *;
    `;
    await this.db.query<Location>(query, [location.name, location.legacy_id]);
  }

  /**
   * Insert a single vnvPrice into the database.
   * @param price The vnvPrice object we want inserted.
   * @returns Nothing.
   */
  async insertPrice(price: vnvPrice): Promise<Price> {
    const query = `
      INSERT INTO prices (name, price, legacy_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (legacy_id)
        DO UPDATE SET name  = EXCLUDED.name,
                      price = EXCLUDED.price
      RETURNING *;
    `;
    const rows = await this.db.query<Price>(query, [
      price.name,
      price.amount,
      price.legacy_id,
    ]);
    return rows[0];
  }
}
