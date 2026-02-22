import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch, Post,
  Put,
  UsePipes,
} from "@nestjs/common";
import { EventService } from "./event.service";
import { ZodValidationPipe } from "../common/pipes/zod.validation.pipe";
import { EventSchema, CreateEventSchema, UpdateEventSchema } from "@repo/common";
import type { Event, CreateEvent, UpdateEvent } from "@repo/common";

@Controller("event")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * Responds to GET /events
   * @returns All Event objects.
   */
  @Get()
  async getAllEvents(): Promise<Event[]> {
    return await this.eventService.getAllEvents();
  }

  /**
   * Responds to GET /events/:id
   * @param id ID in the URL of the request.
   * @returns The Event object with corresponding ID
   */
  // TODO: return multiple events with same production id
  @Get(":id")
  async getEventById(@Param("id", ParseIntPipe) id: number): Promise<Event> {
    return await this.eventService.getEventById(id);
  }

  /**
   * Responds to a PUT to "/event/:id".
   * @param id ID in the URL of the request.
   * @param event The parsed Event object.
   * @returns The updated Event object.
   */
  @Put(":id")
  async replaceEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(EventSchema)) event: Event,
  ): Promise<Event> {
    return await this.eventService.replaceEvent(id, event);
  }

  /**
   * Responds to a PATCH to "/event/:id".
   * @param id ID in the URL of the request.
   * @param patchData The partial Event object that is used to modify.
   * @returns The updated Event object.
   */
  @Patch(":id")
  async modifyEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateEventSchema)) patchData: UpdateEvent,
  ): Promise<Event> {
    return await this.eventService.modifyEvent(id, patchData);
  }

  /**
   * Responds to a DELETE to "/event/:id".
   * @param id ID in the URL of the request.
   * @returns Nothing.
   */
  @Delete(":id")
  async deleteEvent(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.eventService.deleteEvent(id);
  }

  /**
   * Responds to a POST to "/event/".
   * @param newEvent The new Event data we want to add
   * @returns The newly created Event.
   */
  @Post()
  @UsePipes(new ZodValidationPipe(CreateEventSchema))
  async createEvent(
    @Body() newEvent: CreateEvent,
  ): Promise<Event> {
    return this.eventService.createEvent(newEvent);
  }
}
