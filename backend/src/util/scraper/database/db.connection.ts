import { Pool, QueryResultRow } from "pg";
import {
  vnvEvent,
  vnvGenre,
  vnvLocation,
  vnvPrice,
  vnvProduction,
} from "../vnv.parser";
import {
  Production,
  Tag,
  Event,
  Price,
  Location,
  Blog,
  MediaCrop,
} from "@repo/common";
import logger from "../../logger/logger";
import { ResourceGoneException } from "../../../common/exceptions";
import { Injectable } from "@nestjs/common";

/**
 * Holds the Connection to the database and important inserting functions.
 *
 * We defined this separate from the main connection that the backend uses to
 * communicate with the database for two main reasons.
 *  1: The Queries in here are highly specific to this use case and also allows
 *     insert of multiple languages at once (which the backend connection doesn't).
 *  2: If this connection to the database crashes for some reason, the one
 *     used in the backend isn't affected.
 *
 * In short: We chose to split the DB connections for backend and scraper to make
 *           sure there can be no confusions between the two and so they can't
 *           hinder each other either.
 */
@Injectable()
export class UtilsDbConnection {
  /**
   * The Pool to the database, used to execute queries.
   */
  private pool: Pool;
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER_DEV,
      host: process.env.DB_HOST_DEV,
      database: process.env.DB_NAME_DEV,
      password: process.env.DB_PASSWORD_DEV,
      port: Number(process.env.DB_PORT_DEV),
    });
  }

  /**
   * This function sends a query to the database.
   * @param query This is the to be executed query
   * @param params These are the possible parameters used in the query annotated by "$1",... as is convention in SQL.
   * @return a generic type that is a scheme of the database.
   * */
  async query<T extends QueryResultRow = any>(
    query: string,
    params?: any[],
  ): Promise<T[]> {
    try {
      const res = await this.pool.query<T>(query, params);
      return res.rows;
    } catch (error) {
      logger.error(
        `Database Query Failed: ${query}\nParams: ${JSON.stringify(params)}`,
        error,
      );
      throw error; // Let the caller know it failed!
    }
  }

  /**
   * A generic helper to wrap batch processing with progress logging.
   */
  private async trackProgress<T>(
    label: string,
    items: T[],
    processor: (item: T) => Promise<any>,
  ): Promise<void> {
    const total = items.length;
    if (total === 0) return;

    await this.pool.connect(); // Warm up the pool.

    let completed = 0;
    let lastLoggedPercent = -1;
    const startTime = Date.now();

    for (const item of items) {
      try {
        await processor(item);
      } catch (error) {
        logger.error(`Error during ${label} at item ${completed}:`, error);
      }

      completed++;
      const percent = Math.floor((completed / total) * 100);

      if (percent !== lastLoggedPercent) {
        const eta = this.calculateETA(startTime, completed, total);
        logger.info(
          `[DB PROGRESS] ${label}: ${percent}% (${completed}/${total}) | ETA: ${eta}`,
        );
        lastLoggedPercent = percent;
      }
    }

    logger.info(`Finished: ${label}!`);
  }

  /**
   * Calculates the ETA of a network action.
   * @param startTime The starting time of the action.
   * @param current The current items.
   * @param total The total items.
   * @returns A time string.
   */
  private calculateETA(
    startTime: number,
    current: number,
    total: number,
  ): string {
    if (current === 0) return "Calculating...";

    const elapsed = Date.now() - startTime; // ms spent so far
    const msPerItem = elapsed / current;
    const remainingItems = total - current;
    const remainingMs = remainingItems * msPerItem;

    // Convert MS to a nice string like "2m 30s"
    const seconds = Math.floor((remainingMs / 1000) % 60);
    const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  /**
   * Fetches a production by legacy id.
   * @param legacyId The production legacy id.
   * @returns The production row.
   */
  async getProductionByLegacyId(legacyId: string): Promise<Production> {
    if (!legacyId || !legacyId.trim()) {
      throw new Error("legacyId is required to fetch a production");
    }

    const rows = await this.query<Production>(
      `SELECT * FROM productions WHERE legacy_id = $1 LIMIT 1;`,
      [legacyId],
    );

    if (rows.length === 0) {
      throw new ResourceGoneException(
        `No Production exists for provided legacy_id(${legacyId})`,
      );
    }

    return rows[0];
  }

  /**
   * Fetches an event by legacy id.
   * @param legacyId The event legacy id.
   * @returns The event row.
   */
  async getEventByLegacyId(legacyId: string): Promise<Event> {
    if (!legacyId || !legacyId.trim()) {
      throw new Error("legacyId is required to fetch an event");
    }

    const rows = await this.query<Event>(
      `SELECT * FROM events WHERE legacy_id = $1 LIMIT 1;`,
      [legacyId],
    );

    if (rows.length === 0) {
      throw new ResourceGoneException(
        `No Event exists for provided legacy_id(${legacyId})`,
      );
    }

    return rows[0];
  }

  /**
   * Productions.
   */

  /**
   * Inserts a list of vnvProduction objects.
   * @param productions The list of vnvProductions.
   */
  async insertProductions(productions: vnvProduction[]) {
    await this.trackProgress("Productions", productions, (p) =>
      this.insertProduction(p),
    );
  }

  /**
   * Tags
   */

  /**
   * Inserts a list of vnvGenre objects into Tags.
   * @param genres The list of vnvGenre objects.
   */
  async insertTags(genres: vnvGenre[]) {
    await this.trackProgress("Tags", genres, (t) => this.insertTag(t));
  }

  /**
   * Inserts a list of vnvEvent objects into the database.
   * @param events The list of vnvEvent objects.
   */
  async insertEvents(events: vnvEvent[]) {
    await this.trackProgress("Events", events, (e) => this.insertEvent(e));
  }

  /**
   * Inserts a list of vnvLocation objects.
   * @param locations The list of vnvLocation objects.
   */
  async insertLocations(locations: vnvLocation[]) {
    await this.trackProgress("Locations", locations, (l) =>
      this.insertLocation(l),
    );
  }

  /**
   * Insert a list of vnvPrice objects.
   * @param prices The list of vnvPrice objects.
   */
  async insertPrices(prices: vnvPrice[]) {
    await this.trackProgress("Prices", prices, (p) => this.insertPrice(p));
  }

  /**
   * Events
   */

  /**
   * Inserts a Production by it's legacy_id or creates a new one.
   * Also links it's respective tags.
   * @param vnvProduction The vnvProduction we want to add.
   * @returns T/F Whether the change went through or not.
   */
  async insertProduction(vnvProduction: vnvProduction): Promise<Production> {
    const query = `
      INSERT INTO productions (
        titel, description1, description2, artist, 
        tagline, credits, legacy_id, performer_type, attendance_mode
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (legacy_id)
      DO UPDATE SET
        titel = EXCLUDED.titel,
        description1 = EXCLUDED.description1,
        description2 = EXCLUDED.description2,
        artist = EXCLUDED.artist,
        tagline = EXCLUDED.tagline,
        credits = EXCLUDED.credits,
        performer_type = EXCLUDED.performer_type,
        attendance_mode = EXCLUDED.attendance_mode
      RETURNING *;
    `;

    const values = [
      vnvProduction.title,
      vnvProduction.description,
      vnvProduction.description_2,
      vnvProduction.artist,
      vnvProduction.tagline,
      vnvProduction.info,
      vnvProduction.legacy_id,
      vnvProduction.performer_type,
      vnvProduction.attendance_mode,
    ];

    const output: Production[] = await this.query<Production>(query, values);
    const production: Production = output[0];

    // First we unlink all current tags.
    await this.query(
      `
        DELETE FROM production_tag WHERE production_id = $1;
      `,
      [production.id],
    );

    // Now we have to link the tags.
    const tags: Tag[] = await this.query<Tag>(
      `
        SELECT * FROM tags
        WHERE legacy_id = ANY($1::text[]);
      `,
      [vnvProduction.genres],
    );
    for (const tag of tags) {
      const valid: boolean = await this.linkTag(production.id, tag.id);
      if (!valid)
        logger.warn(
          `Failed to link Tag(${tag.id}) to Production(${production.id}).`,
        );
    }

    return production;
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
    const output: Tag[] = await this.query<Tag>(query, values);
    return output[0].id;
  }

  /**
   * Locations
   */

  /**
   * Link a Tag to a Production in the database.
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns T/F Whether the link was created.
   */
  async linkTag(productionId: number, tagId: number): Promise<boolean> {
    const query = `
      INSERT INTO production_tag (production_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.query(query, [productionId, tagId]);
    return output.length >= 1;
  }

  /**
   * Insert a single vnvEvent into the database by it's legacy_id.
   * Also links the appropriate Price objects and Location object.
   * @param vnvEvent The particular vnvEvent.
   * @returns Nothing.
   */
  async insertEvent(vnvEvent: vnvEvent) {
    const productions: Production[] = await this.query<Production>(
      `SELECT * from productions WHERE legacy_id = $1;`,
      [vnvEvent.production_id],
    );

    if (productions.length === 0) {
      logger.warn(
        `Could not find Production(${vnvEvent.production_id}) to link Event(${vnvEvent.legacy_id}) with.`,
      );
      return;
    }
    const productionId: number = productions[0].id;

    // 2. Upsert the Event
    const query = `
      INSERT INTO events (
        starttime, endtime, doors_at, intermission_at, production_id, legacy_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (legacy_id)
      DO UPDATE SET
        starttime = EXCLUDED.starttime,
        endtime = EXCLUDED.endtime,
        doors_at = EXCLUDED.doors_at,
        intermission_at = EXCLUDED.intermission_at,
        production_id = EXCLUDED.production_id
      RETURNING *;
    `;
    const values = [
      vnvEvent.starts_at,
      vnvEvent.ends_at,
      vnvEvent.doors_at,
      vnvEvent.intermission_at,
      productionId,
      vnvEvent.legacy_id,
    ];

    const output: Event[] = await this.query<Event>(query, values);
    const event: Event = output[0];

    // We first unlink the existing Prices so we can replace the links.
    await this.query(
      `
        DELETE FROM event_prices WHERE event_id = $1;
      `,
      [event.id],
    );

    // Now we link the correct prices again.
    const prices: Price[] = await this.query<Price>(
      `
        SELECT * FROM prices
        WHERE legacy_id = ANY($1::text[]);
      `,
      [vnvEvent.prices],
    );
    for (const price of prices) {
      const valid: boolean = await this.linkPrice(event.id, price.id);
      if (!valid)
        logger.warn(`Failed to link Price(${price.id}) to Event(${event.id}).`);
    }

    // We also replace the Event location.
    await this.query(
      `
        DELETE FROM event_locations WHERE event_id = $1;
      `,
      [event.id],
    );
    // We also need to link the Event location.
    const locations: Location[] = await this.query<Location>(
      `
        SELECT * FROM locations
        WHERE legacy_id = $1;
      `,
      [vnvEvent.location],
    );
    const location: Location = locations[0];
    const valid: boolean = await this.linkLocation(event.id, location.id);
    if (!valid)
      logger.warn(
        `Failed to link Location(${location.id}) to Event(${event.id}).`,
      );
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
    await this.query<Location>(query, [location.name, location.legacy_id]);
  }

  /**
   * Price.
   */

  /**
   * Links an Event and a Location by their ids.
   * @param eventId The Event ID.
   * @param locationId The Location ID.
   * @returns T/F Whether it Failed or not.
   */
  async linkLocation(eventId: number, locationId: number): Promise<boolean> {
    const query = `
      INSERT INTO event_locations (event_id, location_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.query(query, [eventId, locationId]);
    return output.length >= 1;
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
      DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price
      RETURNING *;
    `;
    const rows = await this.query<Price>(query, [
      price.name,
      price.amount,
      price.legacy_id,
    ]);
    return rows[0];
  }

  /**
   * Link a Price to an Event.
   * @param eventId The Event ID.
   * @param priceId The Price ID.
   * @returns T/F Whether it Failed or not.
   */
  async linkPrice(eventId: number, priceId: number): Promise<boolean> {
    const query = `
      INSERT INTO event_prices (event_id, price_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.query(query, [eventId, priceId]);
    return output.length >= 1;
  }

  /**
   * Blogs.
   */

  /**
   * Inserts a single blog row.
   * @param titel Localized blog title.
   * @param description Localized blog description.
   * @returns Inserted blog row.
   */
  async insertBlog(
    titel: { en: string; nl: string },
    description: { en: string; nl: string },
  ): Promise<Blog> {
    const rows = await this.query<Blog>(
      `
        INSERT INTO blogs (titel, description)
        VALUES ($1, $2)
        RETURNING *;
      `,
      [titel, description],
    );

    return rows[0];
  }

  /**
   * Links a blog to a production.
   * @param productionId Production id.
   * @param blogId Blog id.
   * @returns T/F Whether the link was created.
   */
  async linkBlog(productionId: number, blogId: number): Promise<boolean> {
    const rows = await this.query(
      `
        INSERT INTO production_blogs (production_id, blog_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [productionId, blogId],
    );

    return rows.length >= 1;
  }

  async getPendingCrops(amount: number): Promise<MediaCrop[]> {
    const pendingCrops = await this.query<MediaCrop>(
      `
      SELECT id, url FROM media_crop
      WHERE url LIKE 'https://img.viernulvier.gent%'
      LIMIT $1;
    `,
      [amount],
    );
    return pendingCrops;
  }
}
