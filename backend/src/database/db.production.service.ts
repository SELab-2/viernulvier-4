import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  BlogDto,
  CreateProductionDto,
  FilterProductionDto,
  MediaGalleryDto,
  ModifyProductionDto,
  PaginationFilterDto,
  ProductionDto,
  ReplaceProductionDto,
  TagDto,
} from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";
import {
  BlogSchema,
  GalleryType,
  MediaGallerySchema,
  PaginatedResponse,
  ProductionSchema,
  SUPPORTED_LANGUAGES,
  TagSchema,
} from "@repo/common";
import {
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";

@Injectable()
export class ProductionDatabaseService {
  constructor(private db: DbService) {}

  /**
   * Get a single Production by their ID.
   * @param id The ID we are looking for.
   * @returns The production if there is one.
   */
  async getProductionById(id: number): Promise<ProductionDto> {
    const returningClause = generateReturningClause(ProductionSchema);

    const query = `
      SELECT ${returningClause}
      FROM productions
      WHERE id = $1;
    `;

    const productions = await this.db.query<ProductionDto>(query, [id]);

    if (productions.length === 0)
      throw new ResourceGoneException(
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
    const tagPrefix = "t";
    const returningClause = generateReturningClause(TagSchema, tagPrefix);

    const query = `
      SELECT ${returningClause}
      FROM tags ${tagPrefix}
      JOIN production_tag pt ON ${tagPrefix}.id = pt.tag_id
      WHERE pt.production_id = $1;
    `;

    return await this.db.query<TagDto>(query, [production.id]);
  }

  /**
   * Get all blogs listed under a given production.
   * @param id the id of the production we want all blogs of.
   * @returns a list of blogs connected to the given production.
   */
  async getBlogsOfProduction(id: number): Promise<BlogDto[]> {
    const blogPrefix = "b";
    const returningClause = generateReturningClause(BlogSchema, blogPrefix);

    const query = `
      SELECT ${returningClause}
      FROM blogs ${blogPrefix}
      JOIN production_blogs pb ON ${blogPrefix}.id = pb.blog_id
      WHERE pb.production_id = $1;
    `;

    return await this.db.query(query, [id]);
  }

  /**
   * Generic get function for productions.
   * @param productionFilters gives the freedom to define the filters of the search you want.
   * @param paginationFilters Filters to do with pagination and ordering.
   * All filters are filtered by equals except for date filters (see function).
   * Not all filters need to be defined, only the ones you want to use.
   * @returns All productions for the given filters.
   */
  async getProductions(
    productionFilters: FilterProductionDto,
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<ProductionDto>> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Filter by location
    // TODO: Rewrite this filter since it would not work anymore under the new location structure.

    // Filter by event date (start or end date)
    if (productionFilters.date) {
      conditions.push(`(DATE(e.starttime) = $${i} OR DATE(e.endtime) = $${i})`);
      values.push(productionFilters.date);
      i++;
    }

    // Filter by given date lying between starttime and endtime (inclusive)
    if (productionFilters.date_between) {
      // Use explicit timestamp comparison to include time component
      conditions.push(`$${i}::timestamp BETWEEN e.starttime AND e.endtime`);
      values.push(productionFilters.date_between);
      i++;
    }

    // Filter events whose starttime is before the provided date
    if (productionFilters.date_before) {
      conditions.push(`e.starttime < $${i}::timestamp`);
      values.push(productionFilters.date_before);
      i++;
    }

    // Filter events whose endtime is after the provided date
    if (productionFilters.date_after) {
      conditions.push(`e.endtime > $${i}::timestamp`);
      values.push(productionFilters.date_after);
      i++;
    }

    // Filter by titel (case-insensitive)
    // Will look anywhere in the title field for what was searched.
    // For all supported languages.
    if (productionFilters.titel) {
      const titelClauses = SUPPORTED_LANGUAGES.map(
        (lang) => `p.titel->>'${lang}' ILIKE $${i}`,
      );

      conditions.push(`(${titelClauses.join(" OR ")})`);
      values.push(`%${productionFilters.titel}%`);
      i++;
    }

    // Will look anywhere in the artist field for what was searched.
    // This checks all supported languages.
    if (productionFilters.artist) {
      const artistClauses = SUPPORTED_LANGUAGES.map(
        (lang) => `p.artist->>'${lang}' ILIKE $${i}`,
      );

      conditions.push(`(${artistClauses.join(" OR ")})`);
      values.push(`%${productionFilters.artist}%`);
      i++;
    }

    // Filter by performance_type
    if (productionFilters.performer_type) {
      conditions.push(`p.performer_type = $${i}`);
      values.push(`%${productionFilters.performer_type}%`);
      i++;
    }

    // Filter by attendance_mode
    if (productionFilters.attendance_mode) {
      conditions.push(`p.attendance_mode = $${i}`);
      values.push(`%${productionFilters.attendance_mode}%`);
      i++;
    }

    // Filter by id
    if (productionFilters.id) {
      conditions.push(`p.id = $${i}`);
      values.push(productionFilters.id);
      i++;
    }

    // Filter by tag id (Production should have all tags we're filtering for.)
    if (productionFilters.tag_ids && productionFilters.tag_ids.length > 0) {
      conditions.push(`
        p.id IN (
          SELECT production_id 
          FROM production_tag 
          WHERE tag_id = ANY($${i}::int[])
          GROUP BY production_id 
          HAVING COUNT(DISTINCT tag_id) = ${productionFilters.tag_ids.length}
        )
      `);
      values.push(productionFilters.tag_ids);
      i++;
    }

    // add more filters here if needed.

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // count query uses same filters but no pagination
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const filterValues = [...values];
    const countQuery = `
    SELECT COUNT(DISTINCT p.id) as count
    FROM productions p
      LEFT JOIN events e ON e.production_id = p.id
    ${whereClause}
  `;

    let paginationClause = "";
    if (paginationFilters.limit > 0) {
      const offset = paginationFilters.page * paginationFilters.limit;
      paginationClause = `LIMIT $${i} OFFSET $${i + 1}`;
      values.push(paginationFilters.limit);
      values.push(offset);
      i += 2;
    }

    // The Ordered by the first held event of the production.
    const query = `
    SELECT
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
    GROUP BY
      p.id
    ORDER BY MIN(e.starttime) ${paginationFilters.descending ? "DESC" : "ASC"} NULLS LAST
    ${paginationClause}
  `;

    const [objects, countResult] = await Promise.all([
      this.db.query<ProductionDto>(query, values),
      this.db.query<{ count: string }>(countQuery, filterValues),
    ]);

    return {
      page: paginationFilters.page,
      limit: paginationFilters.limit,
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
    const { columns, placeholders, values } = generateInsertClause(production);
    const returningClause = generateReturningClause(ProductionSchema);

    const query = `
      INSERT INTO productions (${columns})
      VALUES (${placeholders})
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<ProductionDto>(query, values);

    if (!result.length) {
      throw new Error("Failed to create production");
    }

    return result[0];
  }

  /**
   * Update function for productions. Updates the production in the database.
   * note: this function can be used to update/add all of a certain language to a prod.
   * @param productionId The ID of the production to update.
   * @param production must be of the type "ModifyProduction" or "ReplaceProduction", gives the freedom to define only what needs to be updated.
   * The id field in the production MUST be defined.
   * @returns the updated production if successful.
   */
  async updateProduction(
    productionId: number,
    production: ModifyProductionDto | ReplaceProductionDto,
  ): Promise<ProductionDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(production);
    const returningClause = generateReturningClause(ProductionSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(productionId);

    const query = `
      UPDATE productions
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
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

  /**
   * Gets media gallery linked to a given production.
   * @param prod_id The ID of the production you want.
   * @param type is the type of media you want.
   * @returns The MediaGallery if it exists.
   */
  async getMediaFromProduction(
    prod_id: number,
    type: GalleryType,
  ): Promise<MediaGalleryDto> {
    const galleryPrefix = "mg";
    const returningClause = generateReturningClause(
      MediaGallerySchema,
      galleryPrefix,
    );

    const query = `
      SELECT ${returningClause}
      FROM media_gallery ${galleryPrefix}
      INNER JOIN production_media_gallery pmg ON pmg.gallery_id = ${galleryPrefix}.id
      WHERE pmg.production_id = $1 AND ${galleryPrefix}.type = $2
      ORDER BY ${galleryPrefix}.id
      LIMIT 1
    `;

    const result = await this.db.query<MediaGalleryDto>(query, [prod_id, type]);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Production with ID ${prod_id} has no media gallery of the given type`,
      );
    }

    return result[0];
  }

  /**
   * Links a media gallery to a given production.
   * @param prod_id The ID of the production to link to.
   * @param gallery_id The ID of the media gallery to link.
   */
  async linkMediaToProduction(
    prod_id: number,
    gallery_id: number,
  ): Promise<void> {
    const query = `
    INSERT INTO production_media_gallery (production_id, gallery_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `;

    await this.db.query(query, [prod_id, gallery_id]);
  }

  /**
   * Unlinks a media gallery from a given production.
   * @param prod_id The ID of the production.
   * @param gallery_id The ID of the media gallery to unlink.
   */
  async unlinkMediaFromProduction(
    prod_id: number,
    gallery_id: number,
  ): Promise<void> {
    const query = `
    DELETE FROM production_media_gallery
    WHERE production_id = $1 AND gallery_id = $2
  `;

    await this.db.query(query, [prod_id, gallery_id]);
  }
}
