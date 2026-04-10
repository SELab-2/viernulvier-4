import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { ResourceGoneException } from "../common/exceptions";
import {
  CreateEventDto,
  EventDto,
  FilterEventDto,
  LocationDto,
  PaginationFilterDto,
  PriceDto,
  ReplaceEventDto,
  ModifyEventDto,
} from "../dto/dto";
import {
  EventSchema,
  LocationSchema,
  PaginatedResponse,
  PriceSchema,
} from "@repo/common";
import {
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";

@Injectable()
export class EventDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single EventDto by their ID.
   * @param eventId The ID we're trying to fetch.
   * @returns The EventDto if there is one.
   */
  async getEventById(eventId: number): Promise<EventDto> {
    const returningClause = generateReturningClause(EventSchema);

    const query = `
      SELECT ${returningClause}
      FROM events
      WHERE id = $1;
    `;

    const events = await this.db.query<EventDto>(query, [eventId]);

    if (events.length === 0)
      throw new ResourceGoneException(
        `No EventDto exists for provided ID(${eventId})`,
      );

    return events[0]; // There should be an Event in here if the length is not 0.
  }

  /**
   * Generic get function for events.
   * @param eventFilters gives the freedom to define the filters of the search you want.
   * All filters are filtered by equals except for date filters (see function).
   * Not all filters need to be defined, only the ones you want to use.
   * @returns All events for the given filters.
   */
  async getEvents(
    eventFilters: FilterEventDto,
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<EventDto>> {
    const eventPrefix = "e";
    const returningClause = generateReturningClause(EventSchema, eventPrefix);

    const conditions: string[] = [];
    const values: any[] = [];
    const param = (val: any) => {
      values.push(val);
      return `$${values.length}`;
    };

    // Filter by specific date (matches starttime or endtime)
    // can be split between start and end.
    if (eventFilters.date) {
      const pDate = param(eventFilters.date);
      conditions.push(
        `DATE(e.starttime) = ${pDate} OR DATE(e.endtime) = ${pDate}`,
      );
    }

    // Filter by given date lying between starttime and endtime (inclusive)
    if (eventFilters.date_between) {
      // Use explicit timestamp comparison to include time component
      conditions.push(
        `${param(eventFilters.date_between)}::timestamp BETWEEN e.starttime AND e.endtime`,
      );
    }

    // Filter events whose starttime is before the provided date
    if (eventFilters.date_before) {
      conditions.push(
        `e.starttime < ${param(eventFilters.date_before)}::timestamp`,
      );
    }

    // Filter events whose endtime is after the provided date
    if (eventFilters.date_after) {
      conditions.push(
        `e.endtime > ${param(eventFilters.date_after)}::timestamp`,
      );
    }

    // Filer by id
    if (eventFilters.id) {
      conditions.push(`e.id = ${param(eventFilters.id)}`);
    }

    // Filter by p_id
    if (eventFilters.production_id) {
      conditions.push(`p.id = ${param(eventFilters.production_id)}`);
    }

    // add more filters here if needed.

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // count query uses same filters but no pagination
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const filterValues = [...values];
    const countQuery = `
      SELECT COUNT(*) as count
      FROM events e
        JOIN productions p ON e.production_id = p.id
      ${whereClause}
    `;

    // pagination
    const offset = paginationFilters.page * paginationFilters.limit;
    const paginationClause = `LIMIT ${param(paginationFilters.limit)} OFFSET ${param(offset)}`;

    // p is defined, ignore error
    // using SELECT * seems to be buggy sometimes, so explicitly use all vars.
    const query = `
      SELECT ${returningClause}
      FROM events ${eventPrefix}
      JOIN productions p ON ${eventPrefix}.production_id = p.id
      ${whereClause}
      ORDER BY ${eventPrefix}.starttime ${paginationFilters.descending ? "DESC" : "ASC"}
      ${paginationClause};
    `;

    const [objects, countResult] = await Promise.all([
      this.db.query<EventDto>(query, values),
      this.db.query<{ count: string }>(countQuery, filterValues),
    ]);

    return {
      page: paginationFilters.page,
      limit: paginationFilters.limit,
      totalItems: parseInt(countResult[0].count),
      objects,
    };
  }

  /**
   * Create event function, creates an event in the database.
   * @param event must be of the type "CreateEvent" which has all fields defined besides the primary key id.
   * @returns the added event if it was successful.
   */
  async createEvent(event: CreateEventDto): Promise<EventDto> {
    const { columns, placeholders, values } = generateInsertClause(event);
    const returningClause = generateReturningClause(EventSchema);

    const query = `
      INSERT INTO events (${columns})
      VALUES (${placeholders})
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<EventDto>(query, values);

    // Validate output
    if (!result || result.length === 0) {
      throw new Error("Failed to create event.");
    }

    return result[0];
  }

  /**
   * Update function for events. Updates the event in the database.
   * @param event must be of the type "ModifyEvent" or "ReplaceEventDto", gives the freedom to define only what needs to be updated.
   * The id field in the event MUST be defined.
   * @returns the updated event if successful.
   */
  async updateEvent(
    eventId: number,
    event: ModifyEventDto | ReplaceEventDto,
  ): Promise<EventDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(event);
    const returningClause = generateReturningClause(EventSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(eventId);

    const query = `
      UPDATE events
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<EventDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(`Event with ID(${eventId}) not found.`);
    }

    return result[0]; // should have the updated event only.
  }

  /**
   * Delete function for deleting events from the database.
   * @param blogId must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteEvent(blogId: number): Promise<void> {
    // note we delete on id not p_id as that would affect more events.
    const query = `DELETE FROM events WHERE id = $1 RETURNING id;`;
    const result = await this.db.query(query, [blogId]);
    if (result.length == 0) {
      throw new ResourceGoneException(
        `Cannot delete: Event ${blogId} not found`,
      );
    }
  }

  /**
   * get the location linked with an event
   * @param id the ID of the event we want the location of.
   * @returns the LocationDto of the event.
   */
  async getLocationOfEvent(id: number): Promise<LocationDto> {
    const locationPrefix = "l";
    const returningClause = generateReturningClause(
      LocationSchema,
      locationPrefix,
    );

    const query = `
      SELECT ${returningClause}
      FROM locations ${locationPrefix}
      INNER JOIN event_locations el ON el.location_id = ${locationPrefix}.id
      WHERE el.event_id = $1
      LIMIT 1
    `;

    const result = await this.db.query<LocationDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException("Could not find location");
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
    RETURNING event_id
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
    const query = `DELETE FROM event_locations WHERE event_id = $1 RETURNING event_id;`;
    const result = await this.db.query(query, [event_id]);
    if (result.length === 0) {
      throw new ResourceGoneException(
        `Cannot delete location: Event ${event_id} not found or has no location linked`,
      );
    }
  }

  /**
   * get all the prices linked with an event
   * @param id the ID of the event we want all the prices of.
   * @returns a list of PriceDto objects linked to the given event.
   */
  async getPricesOfEvent(id: number): Promise<PriceDto[]> {
    const pricePrefix = "p";
    const returningClause = generateReturningClause(PriceSchema, pricePrefix);

    const query = `
      SELECT ${returningClause}
      FROM prices ${pricePrefix}
      INNER JOIN event_prices ep ON ep.price_id = ${pricePrefix}.id
      WHERE ep.event_id = $1;
    `;

    return await this.db.query(query, [id]);
  }

  /**
   * link a price to an event
   * @param event_id the ID of the event you want to link
   * @param price_id the ID of the price you want to link
   * @returns T/F whether if the linking was successful.
   */
  async addPriceToEvent(event_id: number, price_id: number): Promise<boolean> {
    const query = `
      INSERT INTO event_prices (event_id, price_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING event_id
    `;

    const result = await this.db.query(query, [event_id, price_id]);

    return result.length !== 0;
  }

  /**
   * Removes a previously linked Price from an existing Event in the Database.
   * @param event_id the ID of the event you want to remove a price of.
   * @param price_id the ID of the price you want to remove.
   * @returns nothing (silent handling.)
   */
  async removePriceFromEvent(
    event_id: number,
    price_id: number,
  ): Promise<void> {
    const query = `
      DELETE FROM event_prices
      WHERE event_prices.event_id = $1 
        AND event_prices.price_id = $2
    `;

    await this.db.query(query, [event_id, price_id]);
  }
}
