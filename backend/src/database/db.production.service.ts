import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  BlogDto,
  CreateProductionDto,
  FilterProductionDto,
  ProductionDto,
  TagDto,
  UpdateProductionDto,
} from "../dto/dto";
import { DEFAULT_LANGUAGE, FilterProductionSchema, Language, } from "@repo/common";

@Injectable()
export class ProductionDatabaseService {
  constructor(private db: DbService) {}

  /**
   * Get a single Production by their ID.
   * @param id The ID we are looking for.
   * @param lang is the language you wish to fetch.
   * @returns The production if there is one.
   */
  async getProductionById(
    id: number,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<ProductionDto> {
    const productions: ProductionDto[] = await this.getProductions(
      FilterProductionSchema.parse({ id: id, language: lang }),
    );
    if (productions.length === 0)
      throw new BadRequestException(
        `No ProductionDto exists for provided ID(${id})`,
      );

    return productions[0]; // There should be a ProductionDto in here if the length is not 0.
  }

  /**
   * Get all tags listed under a given production.
   * @param production the production we want all tags of.
   * @param amount is the amount of events per page (returned)
   * @param page is the page you want (indexed from 0)
   * @param lang is the used language
   * @returns a list of tags connected to the given production.
   */
  async getTagsOfProduction(
    production: ProductionDto,
    amount: number = 0,
    page: number = 0,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<TagDto[]> {
    if (amount === 0) {
      const query = `
      SELECT t.id,
             t.tag->>'${lang}',
             t.legacy_id,
             t.created_at,
             t.updated_at
      FROM tags t
      JOIN production_tag pt ON t.id = pt.tag_id
      WHERE pt.production_id = $1
      `;

      return await this.db.query(query, [production.id]);
    }

    const offset = page * amount;

    const query = `
      SELECT t.id,
             t.tag->>'${lang}',
             t.created_at,
             t.updated_at,
             t.legacy_id
      FROM tags t
      JOIN production_tag pt ON t.id = pt.tag_id
      WHERE pt.production_id = $1
      LIMIT $2 OFFSET $3
      `;

    return await this.db.query(query, [production.id, amount, offset]);
  }

  /**
   * Get all blogs listed under a given production.
   * @param id the id of the production we want all blogs of.
   * @param amount is the amount of events per page (returned)
   * @param page is the page you want (indexed from 0)
   * @param lang is the used language
   * @returns a list of blogs connected to the given production.
   */
  async getBlogsOfProduction(
    id: number,
    amount: number = 0,
    page: number = 0,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<BlogDto[]> {
    if (amount === 0) {
      const query = `
      SELECT b.id, 
             b.titel->>'${lang}', 
             b.description->>'${lang}',
             b.created_at,
             b.updated_at
      FROM blogs b
      JOIN production_blogs pb ON b.id = pb.blog_id
      WHERE pb.production_id = $1
      `;

      return await this.db.query(query, [id]);
    }

    const offset = page * amount;

    const query = `
      SELECT b.id,
             b.titel->>'${lang}',
             b.description->>'${lang}',
             b.created_at,
             b.updated_at,
             b.legacy_id
      FROM blogs b
      JOIN production_blogs pb ON b.id = pb.blog_id
      WHERE pb.production_id = $1
      LIMIT $2 OFFSET $3
      `;

    return await this.db.query(query, [id, amount, offset]);
  }

  /**
   * Generic get function for productions.
   * @param filters gives the freedom to define the filters of the search you want.
   * All filters are filtered by equals except for date filters (see function).
   * Not all filters need to be defined, only the ones you want to use.
   * @returns All productions for the given filters.
   */
  async getProductions(filters: FilterProductionDto): Promise<ProductionDto[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;
    const lang = filters.language ?? DEFAULT_LANGUAGE; // shouldn't need fallback but justin case

    // Filter by location
    if (filters.hall) {
      conditions.push(`e.hall = $${i}`);
      values.push(filters.hall);
      i++;
    }

    // Filter by event date (start or end date)
    if (filters.date) {
      conditions.push(`(DATE(e.starttime) = $${i} OR DATE(e.endtime) = $${i})`);
      values.push(filters.date);
      i++;
    }

    // Filter by given date lying between starttime and endtime (inclusive)
    if (filters.date_between) {
      // Use explicit timestamp comparison to include time component
      conditions.push(`$${i}::timestamp BETWEEN e.starttime AND e.endtime`);
      values.push(filters.date_between);
      i++;
    }

    // Filter events whose starttime is before the provided date
    if (filters.date_before) {
      conditions.push(`e.starttime < $${i}::timestamp`);
      values.push(filters.date_before);
      i++;
    }

    // Filter events whose endtime is after the provided date
    if (filters.date_after) {
      conditions.push(`e.endtime > $${i}::timestamp`);
      values.push(filters.date_after);
      i++;
    }

    // Filter by titel (case-insensitive)
    // Will look anywhere in the title field for what was searched.
    if (filters.titel) {
      conditions.push(`p.titel->>'${lang}' ILIKE $${i}`);
      values.push(`%${filters.titel}%`);
      i++;
    }

    // Filter by artist
    if (filters.artist) {
      conditions.push(`p.artist->>'${lang}' ILIKE $${i}`);
      values.push(`%${filters.artist}%`);
      i++;
    }

    // Filter by performance_mode
    if (filters.artist) {
      conditions.push(`p.performer_mode = $${i}`);
      values.push(`%${filters.performer_mode}%`);
      i++;
    }

    // Filter by attendance_type
    if (filters.artist) {
      conditions.push(`p.attendance_type = $${i}`);
      values.push(`%${filters.attendance_type}%`);
      i++;
    }

    // Filter by id
    if (filters.id) {
      conditions.push(`p.id = $${i}`);
      values.push(filters.id);
      i++;
    }

    // Filter by tag id (Production should have all tags we're filtering for.)
    if (filters.tag_ids && filters.tag_ids.length > 0) {
      conditions.push(`
        p.id IN (
          SELECT production_id 
          FROM production_tag 
          WHERE tag_id = ANY($${i}::int[])
          GROUP BY production_id 
          HAVING COUNT(DISTINCT tag_id) = ${filters.tag_ids.length}
        )
      `);
      values.push(filters.tag_ids);
      i++;
    }

    // add more filters here if needed.

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // pagination
    let paginationClause = "";
    if (filters.limit > 0) {
      const offset = filters.page * filters.limit;

      paginationClause = `
      LIMIT $${i}
      OFFSET $${i + 1}
    `;

      values.push(filters.limit);
      values.push(offset);

      i += 2;
    }

    // p is defined, ignore error
    // need DISTINCT as multiple event for each prod.
    const query = `
      SELECT DISTINCT
        p.id,
        p.titel->>'${lang}' AS titel,
        p.description1->>'${lang}' AS desc1,
        p.description2->>'${lang}' AS desc2,
        p.artist->>'${lang}' AS artist,
        p.tagline->>'${lang}' AS tagline,
        p.credits->>'${lang}' AS credits,
        p.created_at,
        p.updated_at,
        p.legacy_id,
        p.performer_type,
        p.attendance_mode
      FROM productions p
        LEFT JOIN events e ON e.production_id = p.id
          ${whereClause}
      ORDER BY p.id 
        ${paginationClause}
    `;

    return this.db.query<ProductionDto>(query, values);
  }

  /**
   * Create production function, creates a production in the database.
   * @param production must be of the type "CreateProduction" which has all necessary fields defined,
   * @param lang is the language used. ( see Language type for options.)
   * besides primary key id. (database auto-generates that)
   * @returns the added production if it was successful.
   */
  async createProduction(
    production: CreateProductionDto,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<ProductionDto> {
    if (!production.titel) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO productions (
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
      RETURNING
          id,
          titel->>'${lang}' AS titel,
          description1->>'${lang}' AS desc1,
          description2->>'${lang}' AS desc2,
          artist->>'${lang}' AS artist,
          tagline->>'${lang}' AS tagline,
          credits->>'${lang}' AS credits,
          created_at,
          updated_at,
          legacy_id,
          performer_type,
          attendance_mode;
      `;

    const values = [
      production.titel ? { [lang]: production.titel } : null,
      production.description1 ? { [lang]: production.description1 } : null,
      production.description2 ? { [lang]: production.description2 } : null,
      production.artist ? { [lang]: production.artist } : null,
      production.tagline ? { [lang]: production.tagline } : null,
      production.credits ? { [lang]: production.credits } : null,
      production.legacy_id,
      production.performer_type,
      production.attendance_mode,
    ];

    const result = await this.db.query<ProductionDto>(query, values);

    if (!result.length) {
      throw new Error("Failed to create production");
    }

    return result[0];
  }

  /**
   * UNSAFE version of createProduction. Will override if a Production
   * already exists with the same ID.
   * @param production The production object that we want to insert.
   * @param lang is the language used in the production.
   * @returns That same production object but returned from the Database.
   */
  async upsertProduction(
    production: ProductionDto,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<ProductionDto> {
    const query = `
      INSERT INTO productions (
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
      ON CONFLICT (id)
      DO UPDATE SET
        titel = EXCLUDED.titel,
        description1 = EXCLUDED.description1,
        description2 = EXCLUDED.description2,
        artist = EXCLUDED.artist,
        tagline = EXCLUDED.tagline,
        credits = EXCLUDED.credits,
        legacy_id = EXCLUDED.legacy_id,
        performer_type = EXCLUDED.performer_type,
        attendance_mode = EXCLUDED.attendance_mode
        RETURNING
          id,
          titel->>'${lang}' AS titel,
          description1->>'${lang}' AS desc1,
          description2->>'${lang}' AS desc2,
          artist->>'${lang}' AS artist,
          tagline->>'${lang}' AS tagline,
          credits->>'${lang}' AS credits,
          created_at,
          updated_at,
          legacy_id,
          performer_type,
          attendance_mode
      `;

    const values = [
      production.titel ? { [lang]: production.titel } : null,
      production.description1 ? { [lang]: production.description1 } : null,
      production.description2 ? { [lang]: production.description2 } : null,
      production.artist ? { [lang]: production.artist } : null,
      production.tagline ? { [lang]: production.tagline } : null,
      production.credits ? { [lang]: production.credits } : null,
      production.legacy_id ?? null,
      production.performer_type ?? null,
      production.attendance_mode ?? null,
    ];

    const result = await this.db.query<ProductionDto>(query, values);

    if (!result.length) {
      throw new Error("Failed to insert Production.");
    }

    return result[0];
  }

  /**
   * Update function for productions. Updates the production in the database.
   * note: this function can be used to update/add all of a certain language to a prod.
   * @param production must be of the type "UpdateProduction", gives the freedom to define only what needs to be updated.
   * @param lang is the language used.
   * The id field in the production MUST be defined.
   * @returns the updated production if successful.
   */
  async updateProduction(
    production: UpdateProductionDto,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<ProductionDto> {
    if (!production.id) {
      throw new Error("Production id is required for update");
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (production.titel !== undefined) {
      fields.push(
        `titel = COALESCE(artist, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify({ [lang]: production.titel }));
    }

    if (production.description1 !== undefined) {
      fields.push(
        `description1 = COALESCE(artist, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify({ [lang]: production.description1 }));
    }

    if (production.description2 !== undefined) {
      fields.push(
        `description2 = COALESCE(artist, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify({ [lang]: production.description2 }));
    }

    if (production.artist !== undefined) {
      fields.push(
        `artist = COALESCE(artist, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify({ [lang]: production.artist }));
    }

    if (production.tagline !== undefined) {
      fields.push(
        `tagline = COALESCE(tagline, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify({ [lang]: production.tagline }));
    }

    if (production.credits !== undefined) {
      fields.push(
        `credits = COALESCE(credits, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify({ [lang]: production.credits }));
    }

    if (production.legacy_id !== undefined) {
      fields.push(`legacy_id = $${index++}`);
      values.push(production.legacy_id);
    }

    if (production.performer_type !== undefined) {
      fields.push(`performer_mode = $${index++}`);
      values.push(production.performer_type);
    }

    if (production.attendance_mode !== undefined) {
      fields.push(`attendance_type = $${index++}`);
      values.push(production.attendance_mode);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    values.push(production.id);
    const query = `
      UPDATE productions
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING
        id,
        titel->>'${lang}' AS titel,
        description1->>'${lang}' AS desc1,
        description2->>'${lang}' AS desc2,
        artist->>'${lang}' AS artist,
        tagline->>'${lang}' AS tagline,
        credits->>'${lang}' AS credits,
        created_at,
        updated_at,
        legacy_id,
        performer_type,
        attendance_mode;
    `;

    const result = await this.db.query<ProductionDto>(query, values);

    if (result.length === 0) {
      throw new Error("Production not found");
    }

    return result[0];
  }

  /**
   * Delete function for deleting productions from the database.
   * note: deleting a production will auto-delete events from this production.
   * @param id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteProduction(id: number): Promise<void> {
    const query = `DELETE FROM productions WHERE id = $1 RETURNING *`;

    await this.db.query<ProductionDto>(query, [id]);
  }

  /**
   * Delete function for deleting blogs from the database.
   * This function deletes a single blog-LINK associated with a given prod_id
   * note: it does not delete the blog itself only from being linked to the given production.
   * @param production_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * @param blog_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteBlogFromProduction(
    production_id: number,
    blog_id: number,
  ): Promise<void> {
    const query = `
      DELETE FROM production_blogs
      WHERE production_blogs.blog_id = $1
        AND production_blogs.production_id = $2
    `;

    await this.db.query(query, [blog_id, production_id]);
  }

  /**
   * Link an existing blog to a production.
   * @param blog_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * @param production_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async linkBlogWithProductionID(
    blog_id: number,
    production_id: number,
  ): Promise<void> {
    const query = `
      INSERT INTO production_blogs (production_id, blog_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;

    await this.db.query(query, [production_id, blog_id]);
  }

  // -- Tags -- //

  /**
   * Adds an existing Tag to an existing Production in the Database.
   * @param tag_id The ID of the Tag.
   * @param production_id The ID of the Production.
   */
  async addTagToProduction(
    tag_id: number,
    production_id: number,
  ): Promise<void> {
    const query = `
      INSERT INTO production_tag (production_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;

    await this.db.query(query, [production_id, tag_id]);
  }

  /**
   * Removes a previously linked Tag from an existing Production in the Database.
   * @param tag_id The ID of the Tag.
   * @param production_id The ID of the Production.
   */
  async removeTagFromProduction(
    tag_id: number,
    production_id: number,
  ): Promise<void> {
    const query = `
      DELETE FROM production_tag
      WHERE production_tag.tag_id = $1
        AND production_tag.production_id = $2
    `;

    await this.db.query(query, [tag_id, production_id]);
  }
}
