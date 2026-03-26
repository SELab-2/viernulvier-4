import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { CreateLocationDto, LocationDto, ModifyLocationDto } from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";
import { PaginatedResponse } from "@repo/common";

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
    const query = `SELECT id, 
       location, 
       created_at, 
       updated_at
      FROM locations WHERE id = $1`;

    const result = await this.db.query<LocationDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException(`Location with ID ${id} not found`);
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
    amount: number = 0,
    page: number = 0,
  ): Promise<PaginatedResponse<LocationDto>> {
    let query = `
    SELECT id, location, created_at, updated_at
    FROM locations
    ORDER BY id
  `;

    const params: any[] = [];

    if (amount > 0) {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(amount, page * amount);
    }

    const [locations, countResult] = await Promise.all([
      this.db.query<LocationDto>(query, params),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM locations`,
      ),
    ]);

    return {
      page,
      limit: amount,
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
    if (!location.location) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO locations (location)
      VALUES ($1)
      RETURNING
        id,
        location,
        created_at,
        updated_at
      ;
    `;

    const values = [JSON.stringify(location.location)];

    const result = await this.db.query<LocationDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create location");
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
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (location.location !== undefined) {
      fields.push(
        `location = COALESCE(location, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify(location.location));
    }

    if (fields.length === 0) {
      throw new BadRequestException("No fields provided to update");
    }

    values.push(locationId);

    const query = `
      UPDATE locations
      SET ${fields.join(", ")}
      WHERE id = $${index}
    RETURNING
      id,
      location,
      created_at,
      updated_at
    ;
  `;

    const result = await this.db.query<LocationDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Location with ID ${locationId} not found`,
      );
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
    const result = await this.db.query(query, [id]);
    if (result.length === 0) {
      throw new ResourceGoneException(`Location with ID ${id} not found`);
    }
  }

  // insert extra functions here if desired.
}
