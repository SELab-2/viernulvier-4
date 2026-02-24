import { BadRequestException, Injectable } from "@nestjs/common";
import type { CreateEventDto, EventDto, UpdateEventDto } from "../dto/dto";
import { EventDatabaseService } from "../database/db.event.service";

@Injectable()
class EventService {
  constructor(private readonly eventDBService: EventDatabaseService) {}

  /**
   * Fetches all EventDto objects from the DBService
   * @returns All EventDto objects.
   */
  async getAllEvents(): Promise<EventDto[]> {
    return await this.eventDBService.getEvents({});
  }

  /**
   * Fetches EventDto object from the DBService with given ID.
   * @param id ID of the event as it was in the URL.
   * @returns The EventDto object with corresponding ID
   */
  // TODO: return multiple events with same production id
  async getEventById(id: number): Promise<EventDto> {
    return await this.eventDBService.getEventById(id);
  }

  /**
   * Replaces an event in the Database and returns that event.
   * @param id ID of the event as it was in the URL.
   * @param event The event delivered through the request body.
   * @returns The updated EventDto object.
   */
  async replaceEvent(id: number, event: EventDto): Promise<EventDto> {
    if (id !== event.id)
      throw new BadRequestException("ID in the URL must match ID in the body.");

    return await this.eventDBService.updateEvent(event);
  }

  /**
   * Modifies an existing event using the data provided in the request Body.
   * @param id ID of the event as it was in the URL.
   * @param patchData The partial EventDto object used to update the data in the DB.
   * @returns The updated EventDto object.
   */
  async modifyEvent(id: number, patchData: UpdateEventDto): Promise<EventDto> {
    const existingEvent: EventDto = await this.eventDBService.getEventById(id);

    const mergedEvent: EventDto = {
      ...existingEvent,
      ...patchData,
      id, // Force ID.
    };

    return await this.eventDBService.updateEvent(mergedEvent);
  }

  /**
   * Deletes an event from the database.
   * @param id ID of the EventDto we want to delete.
   * @returns Nothing.
   */
  async deleteEvent(id: number): Promise<void> {
    await this.eventDBService.deleteEvent(id);
    return;
  }

  /**
   * Creates an EventDto and adds it to the database
   * @param newEvent The new EventDto data we want to add
   * @returns The newly created EventDto.
   */
  async createEvent(newEvent: CreateEventDto): Promise<EventDto> {
    return await this.eventDBService.createEvent(newEvent);
  }
}

export default EventService;
