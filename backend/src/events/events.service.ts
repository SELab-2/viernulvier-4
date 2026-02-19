import { BadRequestException, Injectable } from "@nestjs/common";
import type { Event, UpdateEvent } from "@repo/common";
import { EventDatabaseService } from "src/database/db.event.service";

@Injectable()
export class EventsService {
  constructor(private readonly eventDBService: EventDatabaseService) {}

  getAll(): string[] {
    return ["Cool event (placeholder)", "Another cool event (placeholder)"];
  }

  getById(id: string): string {
    return `Event with id ${id} (placeholder)`;
  }

  /**
   * Replaces an event in the Database and returns that event.
   * @param id ID of the event as it was in the URL.
   * @param event The event delivered through the request body.
   * @returns The updated Event object.
   */
  async replaceEvent(id: number, event: Event): Promise<Event> {
    if (id !== event.id)
      throw new BadRequestException("ID in the URL must match ID in the body.");

    const updatedEvent: Event = await this.eventDBService.updateEvent(event);

    return updatedEvent;
  }

  /**
   * Modifies an existing event using the data provided in the request Body.
   * @param id ID of the event as it was in the URL.
   * @param patchData The partial Event object used to update the data in the DB.
   * @returns The updated Event object.
   */
  async modifyEvent(id: number, patchData: UpdateEvent): Promise<Event> {
    const existingEvent: Event = await this.eventDBService.getEventById(id);

    const mergedEvent: Event = {
      ...existingEvent,
      ...patchData,
      id, // Force ID.
    };

    const updatedEvent: Event =
      await this.eventDBService.updateEvent(mergedEvent);

    return updatedEvent;
  }
}
