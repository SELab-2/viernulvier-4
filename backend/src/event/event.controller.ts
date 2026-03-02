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
  Query,
  UsePipes,
} from "@nestjs/common";
import EventService from "./event.service";
import { ZodValidationPipe } from "../common/pipes/zod.validation.pipe";
import {
  CreateEventSchema,
  EventSchema,
  FilterEventSchema,
  UpdateEventSchema,
} from "@repo/common";
import { 
  CreateEventDto, 
  EventDto, 
  FilterEventDto, 
  UpdateEventDto 
} from "../dto/dto";
import { ApiBody, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

@Controller("event")
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
   * Responds to GET /events/:id
   * @param id ID in the URL of the request.
   * @returns The EventDto object with corresponding ID
   */
  // TODO: return multiple events with same production id
  @ApiOperation({ summary: "Returns the Event with the ID in the URL." })
  @ApiOkResponse({ type: EventDto, description: "Event Found." })
  @Get(":id")
  async getEventById(@Param("id", ParseIntPipe) id: number): Promise<EventDto> {
    return await this.eventService.getEventById(id);
  }

  /**
   * Responds to a PUT to "/event/:id".
   * @param id ID in the URL of the request.
   * @param event The parsed EventDto object.
   * @returns The updated EventDto object.
   */
  @ApiOperation({ summary: "Replaces an existing Event." })
  @ApiBody({ type: EventDto })
  @ApiOkResponse({ type: EventDto, description: "Event replaced." })
  @Put(":id")
  async replaceEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(EventSchema)) event: EventDto,
  ): Promise<EventDto> {
    return await this.eventService.replaceEvent(id, event);
  }

  /**
   * Responds to a PATCH to "/event/:id".
   * @param id ID in the URL of the request.
   * @param patchData The partial EventDto object that is used to modify.
   * @returns The updated EventDto object.
   */
  @ApiOperation({ summary: "Modifies an existing Event." })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ type: EventDto, description: "Event modified." })
  @Patch(":id")
  async modifyEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateEventSchema)) patchData: UpdateEventDto,
  ): Promise<EventDto> {
    return await this.eventService.modifyEvent(id, patchData);
  }

  /**
   * Responds to a DELETE to "/event/:id".
   * @param id ID in the URL of the request.
   * @returns Nothing.
   */
  @ApiOperation({ summary: "Deletes an Event." })
  @ApiOkResponse({ description: "Event deleted." })
  @Delete(":id")
  async deleteEvent(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.eventService.deleteEvent(id);
  }

  /**
   * Responds to a POST to "/event/".
   * @param newEvent The new EventDto data we want to add
   * @returns The newly created EventDto.
   */
  @ApiOperation({ summary: "Creates an Event." })
  @ApiBody({ type: CreateEventDto })
  @ApiOkResponse({ type: EventDto, description: "Event created." })
  @Post()
  @UsePipes(new ZodValidationPipe(CreateEventSchema))
  async createEvent(@Body() newEvent: CreateEventDto): Promise<EventDto> {
    return this.eventService.createEvent(newEvent);
  }
}
