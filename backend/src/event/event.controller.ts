import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import type { Event } from "@repo/common";
import { EventService } from "./event.service";


@Controller("events")
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
}
