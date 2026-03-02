import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from "@nestjs/common";
import EventService from "../event.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LocationDto } from "../../dto/dto";

@ApiTags("Event - Location")
@Controller("event/:eventId/location")
export class EventLocationController {
  constructor(private readonly eventService: EventService) {}

  /**
   * Responds to GET /event/:eventId/location
   * @param eventId ID in the URL of the request.
   * @returns The Location corresponding to this event.
   */
  @ApiOperation({
    summary: "Returns the Location of an Event.",
  })
  @ApiOkResponse({ type: LocationDto, description: "Location Found." })
  @Get()
  async getLocationOfEvent(
    @Param("eventId", ParseIntPipe) eventId: number,
  ): Promise<LocationDto> {
    return await this.eventService.getLocationForEvent(eventId);
  }

  /**
   * Responds to PUT to "/event/:eventId/location/:locationId".
   * @param eventId The ID of the Event.
   * @param locationId The ID of the Location.
   */
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
   * Responds to a DELETE to "/event/:eventId/location".
   * @param eventId The ID of the Event.
   * @param locationId The ID of the Location.
   * @returns Nothing
   */
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
