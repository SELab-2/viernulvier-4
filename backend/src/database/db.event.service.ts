import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { CreateEventDto, EventDto, FilterEventDto, LocationDto, UpdateEventDto, } from "../dto/dto";
import { FilterEventSchema } from "@repo/common";

@Injectable()
export class EventDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * get the location linked with an event
   * @param id the ID of the event we want the location of.
   * @returns the LocationDto of the event.
   */
  async getLocationOfEvent(id: number): Promise<LocationDto> {
    const query = `
    SELECT l.id, l.location
    FROM locations l
    INNER JOIN event_locations el ON el.location_id = l.id
    WHERE el.event_id = $1
    LIMIT 1
  `;

    const result = await this.db.query(query, [id]);

    if (result.length === 0) {
      throw new Error("Could not find location");
    }

    return result[0];
  }

  /**
   * link a location to an event
   * @param event_id the ID of the event you want to link
   * @param location_id the ID of the location you want to link
   * @returns T/F whether if the linking was successful.
   */
  async linkEventToLocation(
    event_id: number,
    location_id: number,
  ): Promise<boolean> {
    // note an event can only have 1 location linked to it.

    const query = `
    INSERT INTO event_locations (event_id, location_id)
    SELECT $1, $2
    WHERE NOT EXISTS (
      SELECT 1
      FROM event_locations
      WHERE event_id = $1
    )
  `;

    const result = await this.db.query(query, [event_id, location_id]);

    return result.length !== 0;
  }

  /**
   * delete the location from an event.
   * @param event_id the ID of the event you want to remove the location of.
   * @returns nothing (silent handling.)
   */
  async deleteLocationFromEvent(event_id: number): Promise<void> {
    const query = `DELETE FROM event_locations WHERE event_id = $1`;

    await this.db.query(query, [event_id]);
  }

  /**
   * Get a single EventDto by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The EventDto if there is one.
   */
  async getEventById(id: number): Promise<EventDto> {
    const events: EventDto[] = await this.getEvents(
      FilterEventSchema.parse({ id: id }),
    );
    if (events.length === 0)
      throw new BadRequestException(
        `No EventDto exists for provided ID(${id})`,
      );

    return events[0]; // There should be an EventDto in here if the length is not 0.
  }

  /**
   * Generic get function for events.
   * @param filters gives the freedom to define the filters of the search you want.
   * All filters are filtered by equals except for date filters (see function).
   * Not all filters need to be defined, only the ones you want to use.
   * @returns All events for the given filters.
   */
  async getEvents(filters: FilterEventDto): Promise<EventDto[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Filter by specific date (matches starttime or endtime)
    // can be split between start and end.
    if (filters.date) {
      conditions.push(`DATE(e.starttime) = $${i} OR DATE(e.endtime) = $${i}`);
      values.push(filters.date);
      i++;
    }

    // Filter by given date lying between starttime and endtime (inclusive)
    if (filters.date_between) {
      // Use explicit timestamp comparison to include time component
      conditions.push(`$${i}::timestamp BETWEEN e.starttime AND e.endtime`);
      values.push(filters.date_between);
      i++;
    }

    // Filter events whose starttime is before the provided date
    if (filters.date_before) {
      conditions.push(`e.starttime < $${i}::timestamp`);
      values.push(filters.date_before);
      i++;
    }

    // Filter events whose endtime is after the provided date
    if (filters.date_after) {
      conditions.push(`e.endtime > $${i}::timestamp`);
      values.push(filters.date_after);
      i++;
    }

    // Filer by id
    if (filters.id) {
      conditions.push(`e.id = $${i}`);
      values.push(filters.id);
      i++;
    }

    // Filter by p_id
    if (filters.production_id) {
      conditions.push(`p.id = $${i}`);
      values.push(filters.production_id);
      i++;
    }

    // add more filters here if needed.

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // pagination
    let paginationClause = "";
    if (filters.limit > 0) {
      const offset = filters.page * filters.limit;

      paginationClause = `
      LIMIT $${i}
      OFFSET $${i + 1}
    `;

      values.push(filters.limit);
      values.push(offset);
    }

    // p is defined, ignore error
    // using SELECT * seems to be buggy sometimes, so explicitly use all vars.
    const query = `
      SELECT e.id, e.starttime, e.endtime, e.production_id, e.price
      FROM events e
        JOIN productions p ON e.production_id = p.id
          ${whereClause}
      ORDER BY e.starttime 
        ${paginationClause}
        `;

    return this.db.query<EventDto>(query, values);
  }

  /**
   * Create event function, creates an event in the database.
   * @param event must be of the type "CreateEvent" which has all fields defined besides the primary key id.
   * @returns the added event if it was successful.
   */
  async createEvent(event: CreateEventDto): Promise<EventDto> {
    // Validate input, throw error if not all
    if (!event.starttime || !event.production_id) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO events (starttime, endtime, production_id, price)
      VALUES ($1, $2, $3, $4)
      RETURNING id, starttime, endtime, production_id, price
    `;

    const result = await this.db.query<EventDto>(query, [
      event.starttime,
      event.endtime,
      event.production_id,
      event.price,
    ]);

    // Validate output
    if (!result || result.length === 0) {
      throw new Error("Failed to create event");
    }

    return result[0];
  }

  /**
   * Update function for events. Updates the event in the database.
   * @param event must be of the type "UpdateEvent", gives the freedom to define only what needs to be updated.
   * The id field in the event MUST be defined.
   * @returns the updated event if successful.
   */
  async updateEvent(event: UpdateEventDto): Promise<EventDto> {
    if (!event.id) {
      throw new Error("Event id is required for update");
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (event.starttime !== undefined) {
      fields.push(`starttime = $${index++}`);
      values.push(event.starttime);
    }

    if (event.endtime !== undefined) {
      fields.push(`endtime = $${index++}`);
      values.push(event.endtime);
    }

    if (event.price !== undefined) {
      fields.push(`price = $${index++}`);
      values.push(event.price);
    }

    if (event.production_id !== undefined) {
      fields.push(`production_id = $${index++}`);
      values.push(event.production_id);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    values.push(event.id);

    // ignore error on "RETURNING", query is correct.
    const query = `
    UPDATE events
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *;
    `;

    const result = await this.db.query<EventDto>(query, values);

    if (result.length === 0) {
      throw new Error("Event not found");
    }

    return result[0]; // should have the updated event only.
  }

  /**
   * Delete function for deleting events from the database.
   * @param id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteEvent(id: number): Promise<void> {
    // note we delete on id not p_id as that would affect more events.
    // to delete all events using p_id -> use deleteEventsWithPID()
    const query = `DELETE FROM events WHERE id = $1`;

    await this.db.query(query, [id]);
  }

  /**
   * Delete function for deleting all events from the database given a certain p_id.
   * @param production_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteEventsWithPID(production_id: number): Promise<void> {
    // note: here we delete using the production id so possibly multiple events are affected!
    const query = `DELETE FROM events WHERE production_id = $1`;

    await this.db.query(query, [production_id]);
  }
}
