import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import type { Event } from "@repo/common";
import { EventsService } from "./events.service";


@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Responds to GET /events
   * @returns All Event objects.
   */
  @Get()
  async getAllEvents(): Promise<Event[]> {
    return await this.eventsService.getAllEvents();
  }

  /**
   * Responds to GET /events/:id
   * @param id ID in the URL of the request.
   * @returns The Event object with corresponding ID
   */
  @Get(":id")
  async getEventById(@Param("id", ParseIntPipe) id: number): Promise<Event> {
    return await this.eventsService.getEventById(id);
  }
}
