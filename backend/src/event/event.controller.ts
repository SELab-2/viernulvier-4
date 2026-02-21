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
import { ZodValidationPipe } from "src/common/pipes/zod.validation.pipe";
import { EventSchema, CreateEventSchema, UpdateEventSchema } from "@repo/common";
import type { Event, CreateEvent, UpdateEvent } from "@repo/common";

@Controller("event")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // GET /event
  @Get()
  getAll(): string[] {
    return this.eventService.getAll();
  }

  // GET /event/:id
  @Get(":id")
  getById(@Param("id") id: string): string {
    return this.eventService.getById(id);
  }

  /**
   * Responds to a PUT to "/event/:id".
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
    return await this.eventService.replaceEvent(id, event);
  }

  /**
   * Responds to a PATCH to "/event/:id".
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
  async createProduction(
    @Body() newEvent: CreateEvent,
  ): Promise<Event> {
    return this.eventService.createEvent(newEvent);
  }
}
