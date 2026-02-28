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
  UsePipes,
} from "@nestjs/common";
import EventService from "./event.service";
import { ZodValidationPipe } from "../common/pipes/zod.validation.pipe";
import { CreateEventSchema, EventSchema, UpdateEventSchema, } from "@repo/common";
import { BlogDto, CreateEventDto, EventDto, UpdateEventDto } from "../dto/dto";
import { ApiBody, ApiOkResponse, ApiOperation, ApiSecurity, } from "@nestjs/swagger";
import { ApiKeyGuard } from "../database/auth/auth";

@Controller("event")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * Responds to GET /events
   * @returns All EventDto objects.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Returns all Event objects." })
  @ApiOkResponse({
    type: EventDto,
    isArray: true,
    description: "All Events returned.",
  })
  @Get()
  async getAllEvents(): Promise<EventDto[]> {
    return await this.eventService.getAllEvents();
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

  // -- BLOGS -- //

  /**
   * Responds to a GET to "/:id/blog".
   * @param id The id of the Event.
   * @returns A list of all Blog objects linked to this Event.
   */
  @ApiOperation({ summary: "Get Blogs linked to a specific Event." })
  @ApiOkResponse({
    type: BlogDto,
    isArray: true,
    description: "Returned all linked Blogs.",
  })
  @Get(":id/blog")
  async getEventBlogs(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<BlogDto[]> {
    return await this.eventService.getEventBlogs(id);
  }

  /**
   * Responds to a PUT to "/:id/blog/:id2"
   * @param eventId ID of the Event.
   * @param blogId ID of the Blog.
   * @returns The newly linked Blog object.
   */
  @ApiOperation({ summary: "Link a blog to an existing Event." })
  @ApiOkResponse({ type: BlogDto, description: "Linked Blog to Event." })
  @Put(":id/blog/:id2")
  async linkBlogToEvent(
    @Param("id", ParseIntPipe) eventId: number,
    @Param("id2", ParseIntPipe) blogId: number,
  ): Promise<BlogDto> {
    return await this.eventService.linkBlogToEvent(eventId, blogId);
  }

  /**
   * Responds to a DELETE to "/:id/blog/:id2"
   * @param eventId ID of the Event.
   * @param blogId ID of the Blog.
   * @returns The Event we just unlinked the Blog from.
   */
  @ApiOperation({ summary: "Unlink a blog from an existing Event." })
  @ApiOkResponse({ type: EventDto, description: "Unlinked Blog from Event." })
  @Delete(":id/blog/:id2")
  async unlinkBlogFromEvent(
    @Param("id", ParseIntPipe) eventId: number,
    @Param("id2", ParseIntPipe) blogId: number,
  ): Promise<EventDto> {
    return await this.eventService.unlinkBlogFromEvent(eventId, blogId);
  }
}
