import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreateLocationDto,
  LocationDto,
  ModifyLocationDto,
  PaginationFilterDto,
} from "../dto/dto";
import { LocationSchema, PaginatedResponse } from "@repo/common";
import {
  generateCountQuery,
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";
import { ResourceNotFoundException } from "../common/exceptions";

@Injectable()
export class LocationDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single location by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The Location if there is one.
   */
  async getLocationById(id: number): Promise<LocationDto> {
    const returningClause = generateReturningClause(LocationSchema);

    const query = `
      SELECT ${returningClause}
      FROM locations
      WHERE id = $1;
    `;

    const result = await this.db.query<LocationDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceNotFoundException(LocationDto, id);
    }
    return result[0];
  }

  /**
   * Get locations with pagination
   * @param amount number of locations per page (if amount=0, it will default to grabbing all locations)
   * @param page page index (starts at 0)
   * @returns locations
   */
  async getLocations(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<LocationDto>> {
    const returningClause = generateReturningClause(LocationSchema);

    const query = `
      SELECT ${returningClause}
      FROM locations
      ORDER BY id
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = generateCountQuery("locations");

    const offset = paginationFilters.page * paginationFilters.limit;

    const [locations, countResult] = await Promise.all([
      this.db.query<LocationDto>(query, [paginationFilters.limit, offset]),
      this.db.query<{ count: string }>(countQuery),
    ]);

    return {
      page: paginationFilters.page,
      limit: paginationFilters.limit,
      totalItems: parseInt(countResult[0].count),
      objects: locations,
    };
  }

  /**
   * Create location function, creates a location in the database.
   * @param location must be of the type "CreateLocation" which has all fields defined besides the primary key id.
   * @returns the added location if it was successful.
   */
  async createLocation(location: CreateLocationDto): Promise<LocationDto> {
    const { columns, placeholders, values } = generateInsertClause(location);
    const returningClause = generateReturningClause(LocationSchema);

    const query = `
      INSERT INTO locations (${columns})
      VALUES (${placeholders})
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<LocationDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create location.");
    }

    return result[0];
  }

  /**
   * Update function for locations. Updates the location in the database.
   * @param location must be of the type "ModifyLocation", gives the freedom to define only what needs to be updated.
   * The id field in the location MUST be defined.
   * @returns the updated location if successful.
   */
  async updateLocation(
    locationId: number,
    location: ModifyLocationDto,
  ): Promise<LocationDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(location);
    const returningClause = generateReturningClause(LocationSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(locationId);

    const query = `
      UPDATE locations
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<LocationDto>(query, values);

    if (result.length === 0) {
      throw new ResourceNotFoundException(LocationDto, locationId);
    }

    return result[0];
  }

  /**
   * Delete function for deleting locations from the database.
   * @param id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteLocation(id: number): Promise<void> {
    const query = `DELETE FROM locations WHERE id = $1 RETURNING id;`;

    // * NOTE: We don't check for failures here for idempotency.
    await this.db.query(query, [id]);
  }

  // insert extra functions here if desired.
}
