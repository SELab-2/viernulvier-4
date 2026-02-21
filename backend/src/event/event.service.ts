import { Injectable } from "@nestjs/common";
import type { Event } from "@repo/common";
import { EventDatabaseService } from "../database/db.event.service";


@Injectable()
export class EventService {
  constructor(private readonly eventDBService: EventDatabaseService) {}

  /**
   * Fetches all Event objects from the DBService
   * @returns All Event objects.
   */
  async getAllEvents(): Promise<Event[]> {
    return await this.eventDBService.getEvents({});
  }

  /**
   * Fetches Event object from the DBService with given ID.
   * @param id ID of the event as it was in the URL.
   * @returns The Event object with corresponding ID
   */
  // TODO: return multiple events with same production id
  async getEventById(id: number): Promise<Event> {
    return await this.eventDBService.getEventById(id);
  }
}
