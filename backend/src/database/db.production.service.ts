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
  applyExactFilters,
  generateInsertClause,
  generateRelevanceClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";
import {
  MediaNotFoundException,
  ResourceNotFoundException,
} from "../common/exceptions";

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
      throw new ResourceNotFoundException(ProductionDto, id);

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
    const productionPrefix = "p";
    const returningClause = generateReturningClause(
      ProductionSchema,
      productionPrefix,
    );

    const conditions: string[] = [];
    const havingConditions: string[] = [];
    const values: (string | number | number[])[] = [];
    const param = (val: string | number | number[]) => {
      values.push(val);
      return `$${values.length}`;
    };

    // Apply the filters that need exact matches first.
    applyExactFilters(
      productionFilters,
      ["id", "performer_type", "attendance_mode"],
      conditions,
      param,
      productionPrefix,
    );

    // Filter by titel or artist (case-insensitive)
    // * NOTE: Looks through both the artist ant title for the searched sentence.
    // Will look anywhere in the title field for what was searched.
    // For all supported languages.
    if (productionFilters.titelOrArtist) {
      const pTitelOrArtist = param(`%${productionFilters.titelOrArtist}%`);

      const titelClauses = SUPPORTED_LANGUAGES.map(
        (lang) => `p.titel->>'${lang}' ILIKE ${pTitelOrArtist}`,
      );

      const artistClauses = SUPPORTED_LANGUAGES.map(
        (lang) => `p.artist->>'${lang}' ILIKE ${pTitelOrArtist}`,
      );

      // Combine both arrays into one single list
      const allClauses = [...titelClauses, ...artistClauses];

      // Push them as a single string wrapped in parentheses, joined by OR
      conditions.push(`(${allClauses.join(" OR ")})`);
    }

    // Filter by tag id (Production should have all tags we're filtering for.)
    // Filter by tag id (Must have AT LEAST ONE tag - "OR" logic)
    if (
      productionFilters.tag_ids?.length !== undefined &&
      productionFilters.tag_ids?.length > 0
    ) {
      conditions.push(`
        p.id IN (
          SELECT production_id 
          FROM production_tag 
          WHERE tag_id = ANY(${param(productionFilters.tag_ids)}::int[])
        )
      `);
    }

    // HAVING filters.

    // Filter events whose starttime is before the provided date
    if (productionFilters.after) {
      havingConditions.push(
        `MIN(e.starttime) >= ${param(productionFilters.after)}::date`,
      );
    }

    // Filter events whose endtime is after the provided date
    if (productionFilters.before) {
      havingConditions.push(
        // Note: We add one day here to include the day itself too without having to cast the column.
        `MAX(e.endtime) < ${param(productionFilters.before)}::date + interval '1 day'`,
      );
    }

    // add more filters here if needed.

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const havingClause =
      havingConditions.length > 0
        ? `HAVING ${havingConditions.join(" AND ")}`
        : "";

    // count query uses same filters but no pagination
    const filterValues = [...values];
    const countQuery = `
      SELECT COUNT(*) as count
      FROM (
        SELECT p.id
        FROM productions p
          LEFT JOIN events e ON e.production_id = p.id
        ${whereClause}
        GROUP BY p.id
        ${havingClause}
      ) AS matched_productions;
    `;

    // Apply pagination
    const offset = paginationFilters.page * paginationFilters.limit;
    const paginationClause = `LIMIT ${param(paginationFilters.limit)} OFFSET ${param(offset)}`;

    // Ordering (relevance vs date)
    let orderClause = "";
    if (productionFilters.is_suggestion && productionFilters.titelOrArtist) {
      orderClause = generateRelevanceClause(
        productionFilters.titelOrArtist,
        [
          {
            name: `${productionPrefix}.titel`,
            weights: {
              exact: 10,
              prefix: 5,
              partial: 2,
            },
          },
          {
            name: `${productionPrefix}.artist`,
            weights: {
              exact: 10,
              prefix: 5,
              partial: 2,
            },
          },
        ],
        param,
      );
    } else {
      orderClause = `ORDER BY MIN(e.starttime) ${paginationFilters.descending ? "DESC" : "ASC"} NULLS LAST`;
    }

    // The Ordered by the first held event of the production.
    const query = `
      SELECT ${returningClause}
      FROM productions ${productionPrefix}
        LEFT JOIN events e ON e.production_id = ${productionPrefix}.id
      ${whereClause}
      GROUP BY
        ${productionPrefix}.id
      ${havingClause}
      ${orderClause}
      ${paginationClause};
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
      throw new ResourceNotFoundException(ProductionDto, productionId);
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

    // * NOTE: We don't check for failures here for idempotency.
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
      RETURNING *;
    `;

    // * NOTE: We don't check for failures here for idempotency.
    await this.db.query(query, [tag_id, production_id]);
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
      LIMIT 1;
    `;

    const result = await this.db.query<MediaGalleryDto>(query, [prod_id, type]);

    if (result.length === 0) {
      throw new MediaNotFoundException(ProductionDto, type, prod_id);
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
