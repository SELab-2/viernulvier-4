import { Pool, QueryResultRow } from "pg";
import {
  vnvEvent,
  vnvGenre,
  vnvLocation,
  vnvPrice,
  vnvProduction,
} from "./vnv.parser";
import { Production, Tag, Event, Price, Location } from "@repo/common";
import logger from "../logger/logger";

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
export class DbConnection {
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
   * Productions.
   */

  /**
   * Inserts a list of vnvProduction objects.
   * @param productions The list of vnvProductions.
   */
  async insertProductions(productions: vnvProduction[]) {
    logger.info("Inserting Productions...");
    for (const production of productions) {
      await this.insertProduction(production);
    }
  }

  /**
   * Inserts a Production by it's legacy_id or creates a new one.
   * Also links it's respective tags.
   * @param vnvProduction The vnvProduction we want to add.
   * @returns T/F Whether the change went through or not.
   */
  private async insertProduction(
    vnvProduction: vnvProduction,
  ): Promise<Production> {
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
        logger.error(
          `Failed to link Tag(${tag.id}) to Production(${production.id}).`,
        );
    }

    return production;
  }

  /**
   * Tags
   */

  /**
   * Inserts a list of vnvGenre objects into Tags.
   * @param genres The list of vnvGenre objects.
   */
  async insertTags(genres: vnvGenre[]) {
    logger.info("Inserting Tags...");
    for (const genre of genres) {
      await this.insertTag(genre);
    }
  }

  /**
   * Inserts/Updates a single tag into the database based
   * on it's legacy_id.
   * @param genre The vnvGenre that is to be turned into a Tag.
   * @returns The ID of the Tag.
   */
  private async insertTag(genre: vnvGenre): Promise<number> {
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
   * Link a Tag to a Production in the database.
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns T/F Whether the link was created.
   */
  private async linkTag(productionId: number, tagId: number): Promise<boolean> {
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
   * Events
   */

  /**
   * Inserts a list of vnvEvent objects into the database.
   * @param events The list of vnvEvent objects.
   */
  async insertEvents(events: vnvEvent[]) {
    logger.info("Inserting Events...");
    for (const event of events) {
      await this.insertEvent(event);
    }
  }

  /**
   * Insert a single vnvEvent into the database by it's legacy_id.
   * Also links the appropriate Price objects and Location object.
   * @param vnvEvent The particular vnvEvent.
   * @returns Nothing.
   */
  private async insertEvent(vnvEvent: vnvEvent) {
    const productions: Production[] = await this.query<Production>(
      `SELECT * from productions WHERE legacy_id = $1;`,
      [vnvEvent.production_id],
    );

    if (productions.length === 0) {
      logger.error(
        `Could not find Production(${vnvEvent.production_id}) to link Event(${vnvEvent.legacy_id}) with. Aborting...`,
      );
      return;
    }
    logger.info("here4");
    const productionId: number = productions[0].id;
    logger.info("here3");

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

    logger.info("here2");
    const output: Event[] = await this.query<Event>(query, values);
    const event: Event = output[0];
    logger.info("here");

    // We first unlink the existing Prices so we can replace the links.
    await this.query(
      `
        DELETE FROM event_prices WHERE event_id = $1;
      `,
      [event.id],
    );
    logger.info("here5");

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
        logger.error(
          `Failed to link Price(${price.id}) to Event(${event.id}).`,
        );
    }
    logger.info("here6");

    // We also replace the Event location.
    await this.query(
      `
        DELETE FROM event_locations WHERE event_id = $1;
      `,
      [event.id],
    );
    logger.info("here7");
    logger.info(vnvEvent.location);
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
      logger.error(
        `Failed to link Location(${location.id}) to Event(${event.id}).`,
      );
    logger.info("here8");
  }

  /**
   * Locations
   */

  /**
   * Inserts a list of vnvLocation objects.
   * @param locations The list of vnvLocation objects.
   */
  async insertLocations(locations: vnvLocation[]) {
    logger.info("Inserting Locations...");
    for (const location of locations) {
      await this.insertLocation(location);
    }
  }

  /**
   * Inserts a single vnvLocation into the database.
   * @param location The location we want inserted.
   * @returns Nothing.
   */
  private async insertLocation(location: vnvLocation) {
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
   * Links an Event and a Location by their ids.
   * @param eventId The Event ID.
   * @param locationId The Location ID.
   * @returns T/F Whether it Failed or not.
   */
  private async linkLocation(
    eventId: number,
    locationId: number,
  ): Promise<boolean> {
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
   * Price.
   */

  /**
   * Insert a list of vnvPrice objects.
   * @param prices The list of vnvPrice objects.
   */
  async insertPrices(prices: vnvPrice[]) {
    logger.info("Inserting Prices...");
    for (const price of prices) {
      await this.insertPrice(price);
    }
  }

  /**
   * Insert a single vnvPrice into the database.
   * @param price The vnvPrice object we want inserted.
   * @returns Nothing.
   */
  private async insertPrice(price: vnvPrice) {
    const query = `
      INSERT INTO prices (name, price, legacy_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (legacy_id)
      DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price
      RETURNING *;
    `;
    await this.query<Price>(query, [price.name, price.amount, price.legacy_id]);
  }

  /**
   * Link a Price to an Event.
   * @param eventId The Event ID.
   * @param priceId The Price ID.
   * @returns T/F Whether it Failed or not.
   */
  private async linkPrice(eventId: number, priceId: number): Promise<boolean> {
    const query = `
      INSERT INTO event_prices (event_id, price_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.query(query, [eventId, priceId]);
    return output.length >= 1;
  }
}
