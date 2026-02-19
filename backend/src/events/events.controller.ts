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
import { EventsService } from "./events.service";
import { ZodValidationPipe } from "src/common/pipes/zod.validation.pipe";
import { EventSchema, CreateEventSchema, UpdateEventSchema } from "@repo/common";
import type { Event, CreateEvent, UpdateEvent } from "@repo/common";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // GET /events
  @Get()
  getAll(): string[] {
    return this.eventsService.getAll();
  }

  // GET /events/:id
  @Get(":id")
  getById(@Param("id") id: string): string {
    return this.eventsService.getById(id);
  }

  /**
   * Responds to a PUT to "/events/:id".
   * @param id ID in the URL of the request.
   * @param event The parsed Event object.
   * @returns The updated Event object.
   */
  @Put(":id")
  @UsePipes(new ZodValidationPipe(EventSchema))
  async replaceEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() event: Event,
  ): Promise<Event> {
    return await this.eventsService.replaceEvent(id, event);
  }

  /**
   * Responds to a PATCH to "/events/:id".
   * @param id ID in the URL of the request.
   * @param patchData The partial Event object that is used to modify.
   * @returns The updated Event object.
   */
  @Patch(":id")
  @UsePipes(new ZodValidationPipe(UpdateEventSchema))
  async modifyEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() patchData: UpdateEvent,
  ): Promise<Event> {
    return await this.eventsService.modifyEvent(id, patchData);
  }

  /**
   * Responds to a DELETE to "/events/:id".
   * @param id ID in the URL of the request.
   * @returns Nothing.
   */
  @Delete(":id")
  async deleteEvent(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.eventsService.deleteEvent(id);
  }

  /**
   * Responds to a POST to "/events/".
   * @param newEvent The new Event data we want to add
   * @returns The newly created Event.
   */
  @Post()
  @UsePipes(new ZodValidationPipe(CreateEventSchema))
  async createProduction(
    @Body() newEvent: CreateEvent,
  ): Promise<Event> {
    return this.eventsService.createEvent(newEvent);
  }
}
