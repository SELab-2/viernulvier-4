import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { LocationService } from "./location.service";
import {
  CreateLocationDto,
  LanguageQueryDto,
  LocationDto,
  LocationViewDto,
  PaginatedLocationDto,
  PaginatedLocationViewDto,
  PaginationFilterDto,
  UpdateLocationDto,
} from "../dto/dto";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateLocationSchema,
  LanguageQuerySchema,
  PaginationFilterSchema,
  UpdateLocationSchema,
} from "@repo/common";
import { ApiKeyGuard } from "../auth/authGuard";
import { LanguageService } from "../util/language/language.service";
import { ApiOkAnyOf, ApiOkArrayAnyOf } from "../common/decorators/api.ok";

@Controller("locations")
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to a GET to "/locations"
   * @returns A list of all Locations.
   */
  @ApiOperation({ summary: "Fetches a list of all Locations." })
  @ApiOkArrayAnyOf(LocationDto, LocationViewDto)
  @Get()
  async getLocations(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<PaginatedLocationDto | PaginatedLocationViewDto> {
    return this.ls.flattenByLanguage<
      PaginatedLocationDto | PaginatedLocationViewDto
    >(await this.locationService.getLocations(paginationFilter), lang.lang);
  }

  /**
   * Responds to a GET to "/locations/:locationId"
   * @param locationId The ID of the Location we want to find.
   * @returns The Location with that ID.
   */
  @ApiOperation({ summary: "Fetches a Location by it's ID." })
  @ApiOkAnyOf(LocationDto, LocationViewDto)
  @Get(":locationId")
  async getLocationById(
    @Param("locationId", ParseIntPipe) locationId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<LocationDto | LocationViewDto> {
    return this.ls.flattenByLanguage<LocationDto | LocationViewDto>(
      await this.locationService.getLocationById(locationId),
      lang.lang,
    );
  }

  /**
   * Responds to a POST to "/locations"
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
   * Responds to a PATCH to "/locations"
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
   * Responds to a DELETE to "/locations/:locationId"
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
