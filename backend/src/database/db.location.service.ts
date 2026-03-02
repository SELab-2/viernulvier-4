import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { CreateLocationDto, LocationDto, UpdateLocationDto } from "../dto/dto";

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
    const query = `SELECT * FROM locations WHERE id = $1`;

    const result = await this.db.query<LocationDto>(query, [id]);

    if (result.length === 0) {
      throw new Error("Location not found");
    }
    return result[0];
  }

  /**
   * Get locations with pagination
   * @param amount number of locations per page (if amount=0, it will default to grabbing all blogs)
   * @param page page index (starts at 0)
   * @returns locations
   */
  async getLocations(
    amount: number = 0,
    page: number = 0,
  ): Promise<LocationDto[]> {
    const offset = page * amount;

    if (amount === 0) {
      const query = `
      SELECT *
      FROM locations
      ORDER BY id
      `;

      const result = await this.db.query<LocationDto>(query);

      if (result.length === 0) {
        throw new Error("no locations found");
      }

      return result;
    }

    let query = `
    SELECT *
    FROM locations
    ORDER BY id
    LIMIT $1 OFFSET $2
    `;

    const result = await this.db.query<LocationDto>(query, [amount, offset]);

    if (result.length === 0) {
      throw new Error("no locations found");
    }

    return result;
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
    INSERT INTO locations (
      location
    )
    VALUES ($1)
    RETURNING id, location;
  `;

    const values = [location.location];

    const result = await this.db.query<LocationDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create location");
    }

    return result[0];
  }

  /**
   * Update function for locations. Updates the location in the database.
   * @param location must be of the type "UpdateLocation", gives the freedom to define only what needs to be updated.
   * The id field in the location MUST be defined.
   * @returns the updated location if successful.
   */
  async updateLocation(location: UpdateLocationDto): Promise<LocationDto> {
    if (!location.id) {
      throw new Error("Location id is required for update");
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (location.location !== undefined) {
      fields.push(`location = $${index++}`);
      values.push(location.location);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    // Add id as final parameter
    values.push(location.id);

    // ignore "RETURNING" error, query is correct.
    const query = `
    UPDATE locations
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id, location;
  `;

    const result = await this.db.query<LocationDto>(query, values);

    if (result.length === 0) {
      throw new Error("Location not found");
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
    const query = `DELETE FROM locations WHERE id = $1`;

    await this.db.query(query, [id]);
  }

  // insert extra functions here if desired.
}
