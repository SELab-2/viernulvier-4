import { Injectable } from "@nestjs/common";
import type { Event } from "@repo/common";
import { EventDatabaseService } from "../database/db.event.service";


@Injectable()
export class EventService {
  constructor(private readonly eventDBService: EventDatabaseService) {}

  /**
   * Responds to GET /events
   * @returns All Event objects.
   */
  async getAllEvents(): Promise<Event[]> {
    return await this.eventDBService.getEvents({});
  }

  /**
   * Responds to GET /events/:id
   * @param id ID of the event as it was in the URL.
   * @returns The Event object with corresponding ID
   */
  async getEventById(id: number): Promise<Event> {
    return await this.eventDBService.getEventById(id);
  }
}
