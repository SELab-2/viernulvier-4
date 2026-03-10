import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import EventService from "../event.service";
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { LanguageQueryDto, LocationDto, LocationViewDto } from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";
import { LanguageService } from "src/util/language/language.service";
import { ApiOkAnyOf } from "src/common/decorators/api.ok";
import { LanguageQuerySchema } from "@repo/common";
import { ZodValidationPipe } from "nestjs-zod";

@ApiTags("Events - Locations")
@Controller("events/:eventId/locations")
export class EventLocationController {
  constructor(
    private readonly eventService: EventService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to GET /events/:eventId/locations
   * @param eventId ID in the URL of the request.
   * @returns The Location corresponding to this event.
   */
  @ApiOperation({
    summary: "Returns the Location of an Event.",
  })
  @ApiOkAnyOf(LocationDto, LocationViewDto)
  @Get()
  async getLocationOfEvent(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<LocationDto | LocationViewDto> {
    return this.ls.flattenByLanguage(
      await this.eventService.getLocationForEvent(eventId),
      lang.lang,
    );
  }

  /**
   * Responds to PUT to "/events/:eventId/locations/:locationId".
   * @param eventId The ID of the Event.
   * @param locationId The ID of the Location.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Adds a Location to an Event." })
  @ApiOkResponse({
    description: "Successfully added Location to Event.",
  })
  @Put(":locationId")
  async linkEventToLocation(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("locationId", ParseIntPipe) locationId: number,
  ): Promise<boolean> {
    return await this.eventService.linkEventToLocation(eventId, locationId);
  }

  /**
   * Responds to a DELETE to "/events/:eventId/locations".
   * @param eventId The ID of the Event.
   * @returns Nothing
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Removes a Location from an Event." })
  @ApiOkResponse({
    description: "Successfully removed Location from Event.",
  })
  @Delete()
  async unlinkEventFromLocation(
    @Param("eventId", ParseIntPipe) eventId: number,
  ): Promise<void> {
    await this.eventService.unlinkEventFromLocation(eventId);
  }
}
