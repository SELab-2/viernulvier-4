import { Injectable } from "@nestjs/common";
import { LocationDatabaseService } from "../database/db.location.service";
import { CreateLocationDto, LocationDto, UpdateLocationDto } from "../dto/dto";

/**
 * Handles Core functionality for Locations.
 */
@Injectable()
export class LocationService {
  constructor(private readonly locationDbService: LocationDatabaseService) {}

  /**
   * Fetches a Location object by it's ID.
   * @param locationId The ID of the Location we want to fetch.
   * @returns The Location if it exists.
   */
  async getLocationById(locationId: number): Promise<LocationDto> {
    return await this.locationDbService.getLocationById(locationId);
  }

  /**
   * Fetches a list of all Location objects.
   * @returns A list of all Locations.
   */
  async getLocations(): Promise<LocationDto[]> {
    // TODO: Do we have to pass page and amount here? Will we ever have that many locations?
    return await this.locationDbService.getLocations();
  }

  /**
   * Creates a new Location.
   * @param createLocation The Location we want to create.
   * @returns The newly created Location.
   */
  async createLocation(
    createLocation: CreateLocationDto,
  ): Promise<LocationDto> {
    return await this.locationDbService.createLocation(createLocation);
  }

  /**
   * Updates an existing Location.
   * @param updateLocation The Location we want to update.
   * @returns The updated Location.
   */
  async updateLocation(
    updateLocation: UpdateLocationDto,
  ): Promise<LocationDto> {
    return await this.locationDbService.updateLocation(updateLocation);
  }

  /**
   * Deletes an existing Location.
   * @param locationId The ID of the Location.
   */
  async deleteLocation(locationId: number): Promise<void> {
    await this.locationDbService.deleteLocation(locationId);
  }
}
