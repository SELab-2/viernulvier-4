import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  Query,
  UsePipes,
} from "@nestjs/common";
import EventService from "../event.service";
import { ZodValidationPipe } from "../../common/pipes/zod.validation.pipe";
import {
  CreateEventSchema,
  EventSchema,
  FilterEventSchema,
  UpdateEventSchema,
} from "@repo/common";
import { ApiKeyGuard } from "../../auth/authGuard";
import {
  CreateEventDto,
  EventDto,
  FilterEventDto,
  UpdateEventDto,
} from "../../dto/dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";

@Controller("events")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * Responds to GET /events
   * @param filters The filters that should be applied to the query.
   * @returns All EventDto objects.
   */
  @ApiOperation({ summary: "Returns all Event objects." })
  @ApiOkResponse({
    type: EventDto,
    isArray: true,
    description: "All Events returned.",
  })
  @Get()
  @UsePipes(new ZodValidationPipe(FilterEventSchema))
  async getAllEvents(@Query() filters: FilterEventDto): Promise<EventDto[]> {
    return await this.eventService.getAllEvents(filters);
  }

  /**
   * Responds to GET /events/:eventId
   * @param eventId ID in the URL of the request.
   * @returns The EventDto object with corresponding ID
   */
  @ApiOperation({ summary: "Returns the Event with the ID in the URL." })
  @ApiOkResponse({ type: EventDto, description: "Event Found." })
  @Get(":eventId")
  async getEventById(
    @Param("eventId", ParseIntPipe) eventId: number,
  ): Promise<EventDto> {
    return await this.eventService.getEventById(eventId);
  }

  /**
   * Responds to a PUT to "/events/:eventId".
   * @param eventId ID in the URL of the request.
   * @param event The parsed EventDto object.
   * @returns The updated EventDto object.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces an existing Event." })
  @ApiBody({ type: EventDto })
  @ApiOkResponse({ type: EventDto, description: "Event replaced." })
  @Put(":eventId")
  async replaceEvent(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Body(new ZodValidationPipe(EventSchema)) event: EventDto,
  ): Promise<EventDto> {
    return await this.eventService.replaceEvent(eventId, event);
  }

  /**
   * Responds to a PATCH to "/events/:eventId".
   * @param eventId ID in the URL of the request.
   * @param patchData The partial EventDto object that is used to modify.
   * @returns The updated EventDto object.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing Event." })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ type: EventDto, description: "Event modified." })
  @Patch(":eventId")
  async modifyEvent(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Body(new ZodValidationPipe(UpdateEventSchema)) patchData: UpdateEventDto,
  ): Promise<EventDto> {
    return await this.eventService.modifyEvent(eventId, patchData);
  }

  /**
   * Responds to a DELETE to "/events/:eventId".
   * @param eventId ID in the URL of the request.
   * @returns Nothing.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an Event." })
  @ApiOkResponse({ description: "Event deleted." })
  @Delete(":eventId")
  async deleteEvent(
    @Param("eventId", ParseIntPipe) eventId: number,
  ): Promise<void> {
    return await this.eventService.deleteEvent(eventId);
  }

  /**
   * Responds to a POST to "/events".
   * @param newEvent The new EventDto data we want to add
   * @returns The newly created EventDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates an Event." })
  @ApiBody({ type: CreateEventDto })
  @ApiOkResponse({ type: EventDto, description: "Event created." })
  @Post()
  @UsePipes(new ZodValidationPipe(CreateEventSchema))
  async createEvent(@Body() newEvent: CreateEventDto): Promise<EventDto> {
    return this.eventService.createEvent(newEvent);
  }
}
