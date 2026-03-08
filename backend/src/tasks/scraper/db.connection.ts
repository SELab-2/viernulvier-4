import { Pool, QueryResultRow } from "pg";
import { vnvEvent, vnvGenre, vnvProduction } from "./vnv.parser";
import { Production, Tag } from "@repo/common";

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
   * Entrypoint for inserting a production from VNV.
   * Will cascade insert all needed data.
   * @param production The production to start from.
   * @returns T/F Whether all is well.
   */
  async insert(production: vnvProduction): Promise<boolean> {
    const dbProd: Production = await this.insertProduction(production);
    if (!dbProd) return false;

    for (const vnvGenre of production.genres) {
      const tagId: number = await this.insertTag(vnvGenre);
      const newLink: boolean = await this.linkTag(dbProd.id, tagId);
      if (!newLink) console.log("Tag was already linked.");
    }

    const valid: boolean = await this.insertEvents(
      production.events,
      dbProd.id,
    );

    return valid;
  }

  /**
   * Table specific functions.
   */

  /**
   * Inserts a Production by it's legacy_id or creates a new one.
   * @param production The vnvProduction we want to add.
   * @returns T/F Whether the change went through or not.
   */
  private async insertProduction(
    production: vnvProduction,
  ): Promise<Production> {
    const result: Production[] = await this.query<Production>(
      `
        SELECT * from productions WHERE legacy_id = $1
      `,
      [production.legacy_id],
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
          performer_mode = $7,
          attendance_type = $8
        WHERE legacy_id = $9
        RETURNING *;
      `;
      values = [
        production.title,
        production.description,
        production.description_2,
        production.artist,
        production.tagline,
        production.info,
        production.performer_type,
        production.attendance_mode,
        production.legacy_id,
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
        performer_mode,
        attendance_type
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
      `;
      values = [
        production.title,
        production.description,
        production.description_2,
        production.artist,
        production.tagline,
        production.info,
        production.legacy_id,
        production.performer_type,
        production.attendance_mode,
      ];
    }

    const output: Production[] = await this.query<Production>(query, values);

    console.log(`Inserted Production with legacy_id: ${production.legacy_id}`);
    return output[0];
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

    console.log(`Inserted Tag with legacy_id: ${genre.legacy_id}`);
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

  private async insertEvents(
    events: vnvEvent[],
    productionId: number,
  ): Promise<boolean> {
    for (const vnvEvent of events) {
      const event: Event = await this.insertEvent(vnvEvent, productionId);
      console.log(event);
    }
    return true;
  }

  private async insertEvent(
    event: vnvEvent,
    productionId: number,
  ): Promise<Event> {
    const result: Event[] = await this.query<Event>(
      `
        SELECT * from events WHERE legacy_id = $1
      `,
      [event.legacy_id],
    );

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
        WHERE legacy_id = $2
        RETURNING *;
      `;
      values = [
        event.starts_at,
        event.ends_at,
        event.doors_at,
        event.intermission_at,
        productionId,
        event.legacy_id,
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
        event.starts_at,
        event.ends_at,
        event.doors_at,
        event.intermission_at,
        productionId,
        event.legacy_id,
      ];
    }

    const output: Event[] = await this.query<Event>(query, values);

    console.log(`Inserted Event with legacy_id: ${event.legacy_id}`);
    return output[0];
  }
}
