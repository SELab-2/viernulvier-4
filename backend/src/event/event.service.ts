import { Injectable } from "@nestjs/common";
import {
  CreateEventDto,
  EventDto,
  FilterEventDto,
  LocationDto,
  ModifyEventDto,
  PaginationFilterDto,
  PriceDto,
  ReplaceEventDto,
} from "../dto/dto";
import { EventDatabaseService } from "../database/db.event.service";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class EventService {
  constructor(private readonly eventDBService: EventDatabaseService) {}

  /**
   * Fetches all EventDto objects from the DBService
   * @param eventFilters The Filters to be applied to the query.
   * @param paginationFilters Filters to do with pagination and ordering.
   * @returns All EventDto objects.
   */
  async getAllEvents(
    eventFilters: FilterEventDto,
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<EventDto>> {
    return await this.eventDBService.getEvents(eventFilters, paginationFilters);
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
  async replaceEvent(id: number, event: ReplaceEventDto): Promise<EventDto> {
    return await this.eventDBService.updateEvent(id, event);
  }

  /**
   * Modifies an existing event using the data provided in the request Body.
   * @param id ID of the event as it was in the URL.
   * @param patchData The partial EventDto object used to update the data in the DB.
   * @returns The updated EventDto object.
   */
  async modifyEvent(id: number, patchData: ModifyEventDto): Promise<EventDto> {
    return await this.eventDBService.updateEvent(id, patchData);
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

  /**
   * Location specific functionality.
   */

  /**
   * Links an existing Location to an Event.
   * @param eventId The ID of the Event.
   * @param locationId The ID of the Location.
   * @returns T/F whether the link went through.
   */
  async linkEventToLocation(
    eventId: number,
    locationId: number,
  ): Promise<void> {
    await this.eventDBService.linkEventToLocation(eventId, locationId);
  }

  /**
   * Removes a Location from the Event.
   * @param eventId The ID of the Event.
   */
  async unlinkEventFromLocation(eventId: number): Promise<void> {
    await this.eventDBService.deleteLocationFromEvent(eventId);
  }

  /**
   * Returns the Location Linked to the event with ID.
   * @param eventId The ID of the Event.
   * @returns The Location.
   */
  async getLocationForEvent(eventId: number): Promise<LocationDto> {
    return await this.eventDBService.getLocationOfEvent(eventId);
  }

  /**
   * Price specific functionality.
   */

  /**
   * Returns all the Price objects linked to this Event.
   * @param eventId The ID of the Event.
   * @returns The Prices.
   */
  async getPricesForEvent(eventId: number): Promise<PriceDto[]> {
    return await this.eventDBService.getPricesOfEvent(eventId);
  }

  /**
   * Adds an existing Price to an Event.
   * @param eventId The ID of the Event.
   * @param priceId The ID of the Price.
   * @returns T/F whether it worked or not.
   */
  async addPriceToEvent(eventId: number, priceId: number): Promise<boolean> {
    return await this.eventDBService.addPriceToEvent(eventId, priceId);
  }

  /**
   * Removes an existing Price from an Event.
   * @param eventId The ID of the Event.
   * @param priceId The ID of the Price.
   * @returns Nothing.
   */
  async removePriceFromEvent(eventId: number, priceId: number): Promise<void> {
    return await this.eventDBService.removePriceFromEvent(eventId, priceId);
  }
}

export default EventService;
