import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { LocationService } from "./location.service";
import { CreateLocationDto, LocationDto, UpdateLocationDto } from "../dto/dto";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { CreateLocationSchema, UpdateLocationSchema } from "@repo/common";
import { ApiKeyGuard } from "../auth/authGuard";

@Controller("location")
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  /**
   * Responds to a GET to "/location"
   * @returns A list of all Locations.
   */
  @ApiOperation({ summary: "Fetches a list of all Locations." })
  @ApiOkResponse({
    type: LocationDto,
    isArray: true,
    description: "Returned a list of all Locations.",
  })
  @Get()
  async getLocations(): Promise<LocationDto[]> {
    return await this.locationService.getLocations();
  }

  /**
   * Responds to a GET to "/location/:locationId"
   * @param locationId The ID of the Location we want to find.
   * @returns The Location with that ID.
   */
  @ApiOperation({ summary: "Fetches a Location by it's ID." })
  @ApiOkResponse({
    type: LocationDto,
    description: "The Location with provided ID",
  })
  @Get(":locationId")
  async getLocationById(
    @Param("locationId", ParseIntPipe) locationId: number,
  ): Promise<LocationDto> {
    return await this.locationService.getLocationById(locationId);
  }

  /**
   * Responds to a POST to "/location"
   * @param createLocation The Location we want to create.
   * @returns The newly created Location.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new Location." })
  @ApiBody({ type: CreateLocationDto })
  @ApiCreatedResponse({
    type: LocationDto,
    description: "A new Location was created",
  })
  @UsePipes(new ZodValidationPipe(CreateLocationSchema))
  @Post()
  async createLocation(
    @Body() createLocation: CreateLocationDto,
  ): Promise<LocationDto> {
    return await this.locationService.createLocation(createLocation);
  }

  /**
   * Responds to a PATCH to "/location"
   * @param updateLocation The Location we want to update.
   * @returns The newly updated Location.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Updates an existing Location." })
  @ApiBody({ type: UpdateLocationDto })
  @ApiOkResponse({
    type: LocationDto,
    description: "The Location was updated.",
  })
  @UsePipes(new ZodValidationPipe(UpdateLocationSchema))
  @Patch()
  async updateLocation(
    @Body() updateLocation: UpdateLocationDto,
  ): Promise<LocationDto> {
    return await this.locationService.updateLocation(updateLocation);
  }

  /**
   * Responds to a DELETE to "/location/:locationId"
   * @param locationId The ID of the Location we want to delete.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an existing Location." })
  @ApiOkResponse({ description: "Deleted Location." })
  @Delete(":locationId")
  async deleteLocation(
    @Param("locationId", ParseIntPipe) locationId: number,
  ): Promise<void> {
    await this.locationService.deleteLocation(locationId);
  }
}
