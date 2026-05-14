import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  executeWithReferenceCheck,
  generateInsertClause,
  generateRelevanceClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";
import {
  Language,
  PaginatedResponse,
  ProductionSchema,
  SeriesSchema,
  SUPPORTED_LANGUAGES,
} from "@repo/common";
import {
  CreateSeriesDto,
  FilterSeriesDto,
  ModifySeriesDto,
  PaginationFilterDto,
  ProductionDto,
  ReplaceSeriesDto,
  SeriesDto,
} from "../dto/dto";
import {
  ResourceNotFoundException,
  SystemFailureException,
} from "../common/exceptions";

@Injectable()
export class SeriesDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single series by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The Series if there is one.
   * @throws ResourceNotFoundException if there is no series by the provided id. (404)
   */
  async getSeriesById(id: number): Promise<SeriesDto> {
    const returningClause = generateReturningClause(SeriesSchema);

    const query = `
      SELECT ${returningClause}
      FROM series 
      WHERE id = $1;
    `;

    const result = await this.db.query<SeriesDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceNotFoundException(SeriesDto, id);
    }

    return result[0];
  }

  /**
   * Get series with pagination
   * @param paginationFilters are the filters you want to use in the pagination.
   * @param seriesFilters The filters used for series.
   * @return prices
   */
  async getSeries(
    paginationFilters: PaginationFilterDto,
    seriesFilters: FilterSeriesDto,
    language?: Language,
  ): Promise<PaginatedResponse<SeriesDto>> {
    const returningClause = generateReturningClause(SeriesSchema);

    const conditions: string[] = [];
    const values: (string | number)[] = [];
    const param = (val: string | number) => {
      values.push(val);
      return `$${values.length}`;
    };

    // Title filter
    // Looks into the language provided and filters differently based on
    // Whether the query is a suggestion or not.
    if (seriesFilters.title) {
      const searchTerm = seriesFilters.title;

      const allClauses = SUPPORTED_LANGUAGES.flatMap((lang) => {
        if (language && language !== lang) return [];

        const titleField = `titel->>'${lang}'`;

        if (seriesFilters.is_suggestion) {
          const pSearch = param(searchTerm);
          return [`word_similarity(${pSearch}, ${titleField}) > 0.3`];
        } else {
          const pSearch = param(`%${searchTerm}%`);
          return [`${titleField} ILIKE ${pSearch}`];
        }
      });

      // Push them as a single string wrapped in parentheses, joined by OR
      if (allClauses.length > 0) {
        conditions.push(`(${allClauses.join(" OR ")})`);
      }
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const filterValues = [...values];
    const countQuery = `
      SELECT COUNT(*) as count FROM series
      ${whereClause};
    `;

    // pagination
    const offset = paginationFilters.page * paginationFilters.limit;
    const paginationClause = `LIMIT ${param(paginationFilters.limit)} OFFSET ${param(offset)}`;

    // Ordering (relevance vs date)
    let orderClause: string;
    if (seriesFilters.is_suggestion && seriesFilters.title) {
      const relevanceMath = generateRelevanceClause(
        seriesFilters.title,
        [{ name: `titel` }],
        param,
        language,
      );

      orderClause = `ORDER BY ${relevanceMath} DESC`;
    } else {
      orderClause = `ORDER BY created_at ${paginationFilters.descending ? "DESC" : "ASC"}`;
    }

    const query = `
      SELECT ${returningClause}
      FROM series
      ${whereClause}
      ${orderClause}
      ${paginationClause};
    `;

    // Fetch count and objects.
    const [objects, countResult] = await Promise.all([
      this.db.query<SeriesDto>(query, values),
      this.db.query<{ count: string }>(countQuery, filterValues),
    ]);

    return {
      page: paginationFilters.page,
      limit: paginationFilters.limit,
      totalItems: parseInt(countResult[0].count),
      objects: objects,
    };
  }

  /**
   * Create series function, creates a series in the database with the given information.
   * @param series must be of the type "CreateSeries" which has all fields defined besides the primary key id.
   * @returns the added series if it was successful.
   * @throws SystemFailureException if something goes wrong while makes the object.
   */
  async createSeries(series: CreateSeriesDto): Promise<SeriesDto> {
    const { columns, placeholders, values } = generateInsertClause(series);
    const returningClause = generateReturningClause(SeriesSchema);

    const query = `
      INSERT INTO series (${columns})
      VALUES (${placeholders})
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<SeriesDto>(query, values);

    if (result.length === 0) {
      throw new SystemFailureException("Failed to create price.");
    }

    return result[0];
  }

  /**
   * Update function for series. Updates the series in the database.
   * @param seriesId is the id of the series you want to update.
   * @param series must be of the type "ModifySeries" or "ReplaceSeries", gives the freedom to define only what needs to be updated.
   * The id field in the series MUST be defined.
   * @returns the updated series if successful.
   * @throws BadRequestException is no valid fields are provided to be updated. (400)
   * @throws ResourceNotFoundException if there is no series by the provided id. (404)
   */
  async updateSeries(
    seriesId: number,
    series: ModifySeriesDto | ReplaceSeriesDto,
  ): Promise<SeriesDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(series);
    const returningClause = generateReturningClause(SeriesSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(seriesId);

    const query = `
      UPDATE series
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<SeriesDto>(query, values);

    if (result.length === 0) {
      throw new ResourceNotFoundException(SeriesDto, seriesId);
    }

    return result[0];
  }

  /**
   * Delete function for deleting series from the database.
   * @param id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteSeries(id: number): Promise<void> {
    const query = `DELETE FROM series WHERE id = $1`;

    // * NOTE: We don't check for failures here for idempotency.
    await this.db.query(query, [id]);
  }

  /**
   * Link production(s) to a series.
   * @param productions is a list of production ids you want to link.
   * @param seriesId is the id of the series you want to link it to.
   * @returns nothing.
   */
  async linkProductionsToSeries(
    productions: number[],
    seriesId: number,
  ): Promise<void> {
    const query = `
      INSERT INTO production_series (production_id, series_id)
      SELECT unnest($1::int[]), $2
      ON CONFLICT (production_id, series_id) DO NOTHING;
    `;

    await executeWithReferenceCheck(
      this.db.query(query, [productions, seriesId]),
    );
  }

  /**
   * Unlink a production from a series.
   * @param productionId is the id of the production you want to link it to.
   * @param seriesId is the id of the series you want to link it to.
   * @returns nothing.
   */
  async unlinkProductionFromSeries(
    productionId: number,
    seriesId: number,
  ): Promise<void> {
    const query = `DELETE FROM production_series WHERE production_id = $1 AND series_id = $2`;
    await this.db.query(query, [productionId, seriesId]);
  }

  /**
   * Get all productions linked to a series with pagination.
   * @param seriesId is the series you want the productions from
   * @param paginationFilters are the filters you want to use in the pagination.
   * @returns a paginated response of Productions
   */
  async getProductionsFromSeries(
    seriesId: number,
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<ProductionDto>> {
    const returningClause = generateReturningClause(ProductionSchema);
    const offset = paginationFilters.page * paginationFilters.limit;

    // Main query with JOIN, parameterized WHERE clause, and pagination
    const query = `
    SELECT ${returningClause}
    FROM productions
    LEFT JOIN production_series AS ps ON productions.id = ps.production_id
    WHERE ps.series_id = $1
    ORDER BY productions.id
    LIMIT $2 OFFSET $3;
  `;

    // Count query must include the same JOIN and WHERE clause to be accurate
    const countQuery = `
    SELECT COUNT(*) as count 
    FROM productions 
    LEFT JOIN production_series AS ps ON productions.id = ps.production_id 
    WHERE ps.series_id = $1;
  `;

    // Execute both queries in parallel
    const [productions, countResult] = await Promise.all([
      this.db.query<ProductionDto>(query, [
        seriesId,
        paginationFilters.limit,
        offset,
      ]),
      this.db.query<{ count: string }>(countQuery, [seriesId]),
    ]);

    return {
      page: paginationFilters.page,
      limit: paginationFilters.limit,
      totalItems: parseInt(countResult[0].count),
      objects: productions,
    };
  }

  // insert extra functions here if desired.
}
