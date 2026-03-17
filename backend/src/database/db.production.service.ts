import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  BlogDto,
  CreateProductionDto,
  FilterProductionDto,
  PaginatedProductionDto,
  ProductionDto,
  TagDto,
  UpdateProductionDto,
} from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";
import { FilterProductionSchema, SUPPORTED_LANGUAGES } from "@repo/common";

@Injectable()
export class ProductionDatabaseService {
  constructor(private db: DbService) {}

  /**
   * Get a single Production by their ID.
   * @param id The ID we are looking for.
   * @returns The production if there is one.
   */
  async getProductionById(id: number): Promise<ProductionDto> {
    const productions: PaginatedProductionDto = await this.getProductions(
      FilterProductionSchema.parse({ id: id }),
    );

    const production = productions.objects;
    if (production.length === 0)
      throw new ResourceGoneException(
        `No ProductionDto exists for provided ID(${id})`,
      );

    return production[0]; // There should be a ProductionDto in here if the length is not 0.
  }

  /**
   * Get all tags listed under a given production.
   * @param production the production we want all tags of.
   * @param amount is the amount of events per page (returned)
   * @param page is the page you want (indexed from 0)
   * @returns a list of tags connected to the given production.
   */
  async getTagsOfProduction(
    production: ProductionDto,
    amount: number = 0,
    page: number = 0,
  ): Promise<TagDto[]> {
    if (amount === 0) {
      const query = `
      SELECT t.id,
             t.tag,
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
             t.tag,
             t.created_at,
             t.updated_at,
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
   * @returns a list of blogs connected to the given production.
   */
  async getBlogsOfProduction(
    id: number,
    amount: number = 0,
    page: number = 0,
  ): Promise<BlogDto[]> {
    if (amount === 0) {
      const query = `
      SELECT b.id, 
             b.titel, 
             b.description,
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
             b.titel,
             b.description,
             b.created_at,
             b.updated_at,
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
  async getProductions(
    filters: FilterProductionDto,
  ): Promise<PaginatedProductionDto> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Filter by location
    // TODO: Rewrite this filter since it would not work anymore under the new location structure.

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
    // For all supported languages.
    if (filters.titel) {
      const titelClauses = SUPPORTED_LANGUAGES.map(
        (lang) => `p.titel->>'${lang}' ILIKE $${i}`,
      );

      conditions.push(`(${titelClauses.join(" OR ")})`);
      values.push(`%${filters.titel}%`);
      i++;
    }

    // Will look anywhere in the artist field for what was searched.
    // This checks all supported languages.
    if (filters.artist) {
      const artistClauses = SUPPORTED_LANGUAGES.map(
        (lang) => `p.artist->>'${lang}' ILIKE $${i}`,
      );

      conditions.push(`(${artistClauses.join(" OR ")})`);
      values.push(`%${filters.artist}%`);
      i++;
    }

    // Filter by performance_type
    if (filters.performer_type) {
      conditions.push(`p.performer_type = $${i}`);
      values.push(`%${filters.performer_type}%`);
      i++;
    }

    // Filter by attendance_mode
    if (filters.attendance_mode) {
      conditions.push(`p.attendance_mode = $${i}`);
      values.push(`%${filters.attendance_mode}%`);
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

    // count query uses same filters but no pagination
    const filterValues = [...values];
    const countQuery = `
    SELECT COUNT(DISTINCT p.id) as count
    FROM productions p
      LEFT JOIN events e ON e.production_id = p.id
    ${whereClause}
  `;

    let paginationClause = "";
    if (filters.limit > 0) {
      const offset = filters.page * filters.limit;
      paginationClause = `LIMIT $${i} OFFSET $${i + 1}`;
      values.push(filters.limit);
      values.push(offset);
      i += 2;
    }

    const query = `
    SELECT DISTINCT
      p.id,
      p.titel,
      p.description1,
      p.description2,
      p.artist,
      p.tagline,
      p.credits,
      p.created_at,
      p.updated_at,
      p.performer_type,
      p.attendance_mode
    FROM productions p
      LEFT JOIN events e ON e.production_id = p.id
    ${whereClause}
    ORDER BY p.id
    ${paginationClause}
  `;

    const [objects, countResult] = await Promise.all([
      this.db.query<ProductionDto>(query, values),
      this.db.query<{ count: string }>(countQuery, filterValues),
    ]);

    return {
      page: filters.page,
      limit: filters.limit,
      totalItems: parseInt(countResult[0].count),
      objects,
    };
  }

  /**
   * Create production function, creates a production in the database.
   * @param production must be of the type "CreateProduction" which has all necessary fields defined,
   * besides primary key id. (database auto-generates that)
   * @returns the added production if it was successful.
   */
  async createProduction(
    production: CreateProductionDto,
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
          performer_type,
          attendance_mode
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING
          id,
          titel,
          description1,
          description2,
          artist,
          tagline,
          credits,
          created_at,
          updated_at,
          performer_type,
          attendance_mode;
      `;

    const values = [
      production.titel,
      production.description1,
      production.description2,
      production.artist,
      production.tagline,
      production.credits,
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
   * @returns That same production object but returned from the Database.
   */
  async upsertProduction(production: ProductionDto): Promise<ProductionDto> {
    const query = `
      INSERT INTO productions (
        titel,
        description1,
        description2,
        artist,
        tagline,
        credits,
        performer_type,
        attendance_mode
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id)
      DO UPDATE SET
        titel = EXCLUDED.titel,
        description1 = EXCLUDED.description1,
        description2 = EXCLUDED.description2,
        artist = EXCLUDED.artist,
        tagline = EXCLUDED.tagline,
        credits = EXCLUDED.credits,
        performer_type = EXCLUDED.performer_type,
        attendance_mode = EXCLUDED.attendance_mode
        RETURNING
          id,
          titel,
          description1,
          description2,
          artist,
          tagline,
          credits,
          created_at,
          updated_at,
          performer_type,
          attendance_mode
      `;

    const values = [
      production.titel,
      production.description1,
      production.description2,
      production.artist,
      production.tagline,
      production.credits,
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
   * The id field in the production MUST be defined.
   * @returns the updated production if successful.
   */
  async updateProduction(
    productionId: number,
    production: UpdateProductionDto,
  ): Promise<ProductionDto> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    const jsonbColumns = [
      "titel",
      "description1",
      "description2",
      "artist",
      "tagline",
      "credits",
    ] as const;
    for (const column of jsonbColumns) {
      if (production[column] !== undefined) {
        fields.push(
          `${column} = COALESCE(${column}, '{}'::jsonb) || $${index++}::jsonb`,
        );

        values.push(JSON.stringify(production[column]));
      }
    }

    if (production.performer_type !== undefined) {
      fields.push(`performer_type = $${index++}`);
      values.push(production.performer_type);
    }

    if (production.attendance_mode !== undefined) {
      fields.push(`attendance_mode = $${index++}`);
      values.push(production.attendance_mode);
    }

    if (fields.length === 0) {
      throw new BadRequestException("No fields provided to update");
    }

    values.push(productionId);
    const query = `
      UPDATE productions
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING
        id,
        titel,
        description1,
        description2,
        artist,
        tagline,
        credits,
        created_at,
        updated_at,
        performer_type,
        attendance_mode;
    `;

    const result = await this.db.query<ProductionDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException("Production not found");
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
        RETURNING *;
    `;
    const result = await this.db.query(query, [blog_id, production_id]);
    if (result.length == 0) {
      throw new ResourceGoneException(
        "Cannot delete: Blog-Production link not found",
      );
    }
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
      RETURNING *;
    `;
    const result = await this.db.query(query, [tag_id, production_id]);
    if (result.length == 0) {
      throw new ResourceGoneException(
        "Cannot delete: Tag-Production link not found",
      );
    }
  }
}
