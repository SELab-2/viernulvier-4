import { Pool, QueryResultRow } from "pg";
import {
  vnvEvent,
  vnvGenre,
  vnvLocation,
  vnvPrice,
  vnvProduction,
} from "./vnv.parser";
import { Production, Tag, Event, Price, Location } from "@repo/common";

// TODO: Add last Scrape Date function
// TODO: Rewrite queries to use ON CONFLICT clause.

export class DbConnection {
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

  async insertProductions(productions: vnvProduction[]) {
    for (const production of productions) {
      await this.insertProduction(production);
    }
  }

  /**
   * Inserts a Production by it's legacy_id or creates a new one.
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
        console.log(
          `Failed to link Tag(${tag.id}) to Production(${production.id}).`,
        );
    }

    console.log(
      `Inserted Production with legacy_id: ${vnvProduction.legacy_id}`,
    );
    return production;
  }

  /**
   * Tags
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

    console.log(`Inserted Tag with legacy_id: ${genre.legacy_id}.`);
    return output[0].id;
  }

  /**
   * Link a Tag to a Production in the database.
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns T/F Whether the link was created.
   */
  private async linkTag(productionId: number, tagId: number): Promise<boolean> {
    console.log(
      `Linking Tag with ID=${tagId} to production with ID=${productionId}.`,
    );

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

  async insertEvents(events: vnvEvent[]) {
    for (const event of events) {
      await this.insertEvent(event);
    }
  }

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
      console.error(
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

    // Now we also need to link the prices to the event.
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
        console.log(`Failed to link Price(${price.id}) to Event(${event.id}).`);
    }

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
      console.log(
        `Failed to link Location(${location.id}) to Event(${event.id}).`,
      );

    console.log(`Inserted Event with legacy_id: ${vnvEvent.legacy_id}.`);
    return event;
  }

  async insertLocations(locations: vnvLocation[]) {
    for (const location of locations) {
      await this.insertLocation(location);
    }
  }

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
        WHERE legacy_id = $2
        RETURNING *;
      `;
      values = [location.name, location.legacy_id];
    } else {
      query = `INSERT INTO locations (
        location,
        legacy_id
      )
      VALUES ($1,$2)
      RETURNING *;
      `;
      values = [location.name, location.legacy_id];
    }

    const output: Tag[] = await this.query<Tag>(query, values);

    console.log(`Inserted Location with legacy_id: ${location.legacy_id}`);
    return output[0].id;
  }

  private async linkLocation(
    eventId: number,
    locationId: number,
  ): Promise<boolean> {
    console.log(
      `Linking Location with ID=${locationId} to Event with ID=${eventId}.`,
    );

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
   * Price insertion.
   */

  async insertPrices(prices: vnvPrice[]) {
    for (const price of prices) {
      await this.insertPrice(price);
    }
  }

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

    const output: Price[] = await this.query<Price>(query, values);

    console.log(`Inserted Price with legacy_id: ${price.legacy_id}`);
    return output[0].id;
  }

  private async linkPrice(eventId: number, priceId: number): Promise<boolean> {
    console.log(
      `Linking Price with ID=${priceId} to Event with ID=${eventId}.`,
    );

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
