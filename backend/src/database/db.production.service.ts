import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  BlogDto,
  CreateProductionDto,
  ProductionDto,
  TagDto,
  UpdateProductionDto,
} from "../dto/dto";

@Injectable()
export class ProductionDatabaseService {
  constructor(private db: DbService) {}

  /**
   * Get a single ProductionDto by their ID.
   * @param id The ID we are looking for.
   * @returns The production if there is one.
   */
  async getProductionById(id: number): Promise<ProductionDto> {
    const productions: ProductionDto[] = await this.getProductions({ id: id });
    if (productions.length === 0)
      throw new BadRequestException(
        `No ProductionDto exists for provided ID(${id})`,
      );

    return productions[0]; // There should be a ProductionDto in here if the length is not 0.
  }

  /**
   * Get all tags listed under a given production.
   * @param production the production we want all tags of.
   * @returns a list of tags connected to the given production.
   */
  async getTagsOfProduction(production: ProductionDto): Promise<TagDto[]> {
    const query = `
    SELECT t.*
    FROM tags t
    JOIN production_tag pt ON t.id = pt.tag_id
    WHERE pt.production_id = $1
  `;

    return await this.db.query(query, [production.id]);
  }

  /**
   * Get all blogs listed under a given production.
   * @param id the id of the production we want all blogs of.
   * @returns a list of blogs connected to the given production.
   */
  async getBlogsOfProduction(id: number): Promise<BlogDto[]> {
    const query = `
    SELECT b.*
    FROM blogs b
    JOIN production_blogs pb ON b.id = pb.blog_id
    WHERE pb.production_id = $1
  `;

    return await this.db.query(query, [id]);
  }

  /**
   * Generic get function for productions.
   * @param filters gives the freedom to define the filters of the search you want.
   * All filters are filtered by equals except for date filters (see function).
   * Not all filters need to be defined, only the ones you want to use.
   * i.e: getProductions({genre: genre}) will give a list of all productions with the given genre.
   * @returns All productions for the given filters.
   */
  async getProductions(
    filters: Partial<{
      genre: string;
      hall: string;
      date: string;
      // Return events where the provided date lies between starttime and endtime
      date_between: string;
      // Return events where starttime is before the provided date
      date_before: string;
      // Return events where endtime is after the provided date
      date_after: string;
      titel: string;
      id: number;
      tag_id: number;
    }>,
  ): Promise<ProductionDto[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Filter by production genre
    if (filters.genre) {
      conditions.push(`p.genre = $${i}`);
      values.push(filters.genre);
      i++;
    }

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

    // Filter by titel
    if (filters.titel) {
      conditions.push(`p.titel = $${i}`);
      values.push(filters.titel);
      i++;
    }

    // Filter by id
    if (filters.id) {
      conditions.push(`p.id = $${i}`);
      values.push(filters.id);
      i++;
    }

    // Filter by tag id
    if (filters.tag_id) {
      conditions.push(`pt.tag_id = $${i}`);
      values.push(filters.tag_id);
      i++;
    }

    // add more filters here if needed.

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // p is defined, ignore error
    // need DISTINCT as multiple event for each prod.
    const query = `
      SELECT DISTINCT
        p.id,
        p.titel,
        p.ondertitel,
        p.description1,
        p.description2,
        p.genre,
        p.planning_id
      FROM productions p
        LEFT JOIN events e ON e.production_id = p.id
        LEFT JOIN production_tag pt on p.id = pt.production_id
          ${whereClause}
      ORDER BY p.id
    `;

    return this.db.query<ProductionDto>(query, values);
  }

  /**
   * Create production function, creates a production in the database.
   * @param production must be of the type "CreateProduction" which has all fields defined,
   * besides primary key id. (database auto-generates that)
   * @returns the added production if it was successful.
   */
  async createProduction(
    production: CreateProductionDto,
  ): Promise<ProductionDto> {
    if (!production.titel || !production.genre) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
    INSERT INTO productions (
        titel,
        ondertitel,
        description1,
        description2,
        genre,
        planning_id
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING
        id,
        titel,
        ondertitel,
        description1,
        description2,
        genre,
        planning_id
  `;

    const values = [
      production.titel,
      production.ondertitel ?? null,
      production.description1 ?? null,
      production.description2 ?? null,
      production.genre,
      production.planning_id ?? null,
    ];

    const result = await this.db.query<ProductionDto>(query, values);

    if (!result.length) {
      throw new Error("Failed to create production");
    }

    return result[0];
  }

  /**
   * Update function for productions. Updates the production in the database.
   * @param production must be of the type "UpdateProduction", gives the freedom to define only what needs to be updated.
   * The id field in the production MUST be defined.
   * @returns the updated production if successful.
   */
  async updateProduction(
    production: UpdateProductionDto,
  ): Promise<ProductionDto> {
    if (!production.id) {
      throw new Error("Production id is required for update");
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (production.titel !== undefined) {
      fields.push(`titel = $${index++}`);
      values.push(production.titel);
    }

    if (production.ondertitel !== undefined) {
      fields.push(`ondertitel = $${index++}`);
      values.push(production.ondertitel);
    }

    if (production.description1 !== undefined) {
      fields.push(`description1 = $${index++}`);
      values.push(production.description1);
    }

    if (production.description2 !== undefined) {
      fields.push(`description2 = $${index++}`);
      values.push(production.description2);
    }

    if (production.genre !== undefined) {
      fields.push(`genre = $${index++}`);
      values.push(production.genre);
    }

    if (production.planning_id !== undefined) {
      fields.push(`planning_id = $${index++}`);
      values.push(production.planning_id);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    // Add id as the last parameter
    values.push(production.id);

    // ignore error on "RETURNING", query is correct.
    const query = `
    UPDATE productions
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *;
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
   * This function deletes all blogs associated with a given production_id
   * @param production_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteBlogsWithProductionID(production_id: number): Promise<void> {
    const query = `
      DELETE FROM blogs
        USING production_blogs
      WHERE blogs.id = production_blogs.blog_id
        AND production_blogs.production_id = $1
    `;

    await this.db.query(query, [production_id]);
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
