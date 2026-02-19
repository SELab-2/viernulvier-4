import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  UsePipes,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { ZodValidationPipe } from "src/common/pipes/zod.validation.pipe";
import { EventSchema, UpdateEventSchema } from "@repo/common";
import type { Event, UpdateEvent } from "@repo/common";

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

  @Patch(":id")
  @UsePipes(new ZodValidationPipe(UpdateEventSchema))
  async modifyEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() patchData: UpdateEvent,
  ): Promise<Event> {
    return await this.eventsService.modifyEvent(id, patchData);
  }
}
