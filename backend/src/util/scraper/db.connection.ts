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

// TODO: Add last Scrape Date function
// TODO: Rewrite queries to use ON CONFLICT clause.

/**
 * Holds the Connection to the database and important inserting functions.
 */
export class DbConnection {
  /**
   * The Pool to the database, used to execute queries.
   */
  private pool: Pool;

  // to edit database params go to your .env file.
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
    const res = await this.pool.query<T>(query, params); // keep await.
    return res.rows;
  }

  /**
   * Productions.
   */

  /**
   * Inserts a list of vnvProduction objects.
   * @param productions The list of vnvProductions.
   */
  async insertProductions(productions: vnvProduction[]) {
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
    const result: Production[] = await this.query<Production>(
      `
        SELECT * from productions WHERE legacy_id = $1
      `,
      [vnvProduction.legacy_id],
    );

    // If we have found a matching production we can insert safely.
    let query: string;
    let values;
    if (result.length > 0) {
      query = `
        UPDATE productions
        SET 
          titel = $1,
          description1 = $2,
          description2 = $3,
          artist = $4,
          tagline = $5,
          credits = $6,
          performer_type = $7,
          attendance_mode = $8
        WHERE legacy_id = $9
        RETURNING *;
      `;
      values = [
        vnvProduction.title,
        vnvProduction.description,
        vnvProduction.description_2,
        vnvProduction.artist,
        vnvProduction.tagline,
        vnvProduction.info,
        vnvProduction.performer_type,
        vnvProduction.attendance_mode,
        vnvProduction.legacy_id,
      ];
    } else {
      query = `INSERT INTO productions (
        titel,
        description1,
        description2,
        artist,
        tagline,
        credits,
        legacy_id,
        performer_type,
        attendance_mode
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
      `;
      values = [
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
    }

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
    const result: Tag[] = await this.query<Tag>(
      `
        SELECT * from tags WHERE legacy_id = $1
      `,
      [genre.legacy_id],
    );

    let query: string;
    let values;
    if (result.length > 0) {
      query = `
        UPDATE tags
        SET 
          tag = $1
        WHERE legacy_id = $2
        RETURNING *;
      `;
      values = [genre.name, genre.legacy_id];
    } else {
      query = `INSERT INTO tags (
        tag,
        legacy_id
      )
      VALUES ($1,$2)
      RETURNING *;
      `;
      values = [genre.name, genre.legacy_id];
    }

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
    const result: Event[] = await this.query<Event>(
      `
        SELECT * from events WHERE legacy_id = $1;
      `,
      [vnvEvent.legacy_id],
    );

    const productions: Production[] = await this.query<Production>(
      `
        SELECT * from productions WHERE legacy_id = $1;
      `,
      [vnvEvent.production_id],
    );
    if (productions.length == 0) {
      logger.error(
        `Could not find Production(${vnvEvent.production_id}) to link Event(${vnvEvent.legacy_id}) with. Aborting...`,
      );
      return;
    }
    const productionId: number = productions[0].id;

    let query: string;
    let values;
    if (result.length > 0) {
      query = `
        UPDATE events
        SET 
          starttime = $1,
          endtime = $2,
          doors_at = $3,
          intermission_at = $4,
          production_id = $5
        WHERE legacy_id = $6
        RETURNING *;
      `;
      values = [
        vnvEvent.starts_at,
        vnvEvent.ends_at,
        vnvEvent.doors_at,
        vnvEvent.intermission_at,
        productionId,
        vnvEvent.legacy_id,
      ];
    } else {
      query = `INSERT INTO events (
        starttime,
        endtime,
        doors_at,
        intermission_at,
        production_id,
        legacy_id
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
      `;
      values = [
        vnvEvent.starts_at,
        vnvEvent.ends_at,
        vnvEvent.doors_at,
        vnvEvent.intermission_at,
        productionId,
        vnvEvent.legacy_id,
      ];
    }

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
        logger.error(
          `Failed to link Price(${price.id}) to Event(${event.id}).`,
        );
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
      logger.error(
        `Failed to link Location(${location.id}) to Event(${event.id}).`,
      );
  }

  /**
   * Locations
   */

  /**
   * Inserts a list of vnvLocation objects.
   * @param locations The list of vnvLocation objects.
   */
  async insertLocations(locations: vnvLocation[]) {
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
    const result: Location[] = await this.query<Location>(
      `
        SELECT * from locations WHERE legacy_id = $1
      `,
      [location.legacy_id],
    );

    let query: string;
    let values;
    if (result.length > 0) {
      query = `
        UPDATE locations
        SET 
          location = $1
        WHERE legacy_id = $2;
      `;
      values = [location.name, location.legacy_id];
    } else {
      query = `INSERT INTO locations (
        location,
        legacy_id
      )
      VALUES ($1,$2);
      `;
      values = [location.name, location.legacy_id];
    }

    await this.query<Tag>(query, values);
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
    const result: Price[] = await this.query<Price>(
      `
        SELECT * from prices WHERE legacy_id = $1
      `,
      [price.legacy_id],
    );

    let query: string;
    let values;
    if (result.length > 0) {
      query = `
        UPDATE prices
        SET 
          name = $1,
          price = $2
        WHERE legacy_id = $3
        RETURNING *;
      `;
      values = [price.name, price.amount, price.legacy_id];
    } else {
      query = `INSERT INTO prices (
        name,
        price,
        legacy_id
      )
      VALUES ($1,$2,$3)
      RETURNING *;
      `;
      values = [price.name, price.amount, price.legacy_id];
    }

    await this.query<Price>(query, values);
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
