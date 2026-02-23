import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { CreateEvent, Event, UpdateEvent } from "@repo/common";

@Injectable()
export class EventDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single Event by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The Event if there is one.
   */
  async getEventById(id: number): Promise<Event> {
    const events: Event[] = await this.getEvents({ id: id });
    if (events.length === 0)
      throw new BadRequestException(`No Event exists for provided ID(${id})`);

    return events[0]; // There should be an Event in here if the length is not 0.
  }

  /**
   * Generic get function for events.
   * @param filters gives the freedom to define the filters of the search you want.
   * All filters are filtered by equals.
   * Not all filters need to be defined, only the ones you want to use.
   * i.e: getEvents({p_id: id}) will give a list of all events with the given p_id.
   * @returns All events for the given filters.
   */
  async getEvents(
    filters: Partial<{
      genre: string;
      date: string;
      hall: string;
      id: number;
      production_id: number;
    }>,
  ): Promise<Event[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Filter by production genre
    if (filters.genre) {
      conditions.push(`p.genre = $${i}`);
      values.push(filters.genre);
      i++;
    }

    // Filter by specific date (matches starttime or endtime)
    // can be split between start and end.
    if (filters.date) {
      conditions.push(`DATE(e.starttime) = $${i} OR DATE(e.endtime) = $${i}`);
      values.push(filters.date);
      i++;
    }

    // Filter by hall
    if (filters.hall) {
      conditions.push(`e.hall = $${i}`);
      values.push(filters.hall);
      i++;
    }

    // Filer by id
    if (filters.id) {
      conditions.push(`p.id = $${i}`);
      values.push(filters.id);
      i++;
    }

    // Filter by p_id
    if (filters.production_id) {
      conditions.push(`p.production_id = $${i}`);
      values.push(filters.production_id);
      i++;
    }

    // add more filters here if needed.

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // p is defined, ignore error
    // using SELECT * seems to be buggy sometimes, so explicitly use all vars.
    const query = `
      SELECT e.id, e.starttime, e.endtime, e.hall, e.production_id, e.price
      FROM events e
        JOIN productions p ON e.production_id = p.id
          ${whereClause}
      ORDER BY e.starttime
        `;

    return this.db.query<Event>(query, values);
  }

  /**
   * Create event function, creates an event in the database.
   * @param event must be of the type "CreateEvent" which has all fields defined besides the primary key id.
   * @returns the added event if it was successful.
   */
  async createEvent(event: CreateEvent): Promise<Event> {
    // Validate input, throw error if not all
    if (!event.starttime || !event.hall || !event.production_id) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO events (starttime, endtime, hall, production_id, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, starttime, endtime, hall, production_id, price
    `;

    const result = await this.db.query<Event>(query, [
      event.starttime,
      event.endtime,
      event.hall,
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
  async updateEvent(event: UpdateEvent): Promise<Event> {
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

    if (event.hall !== undefined) {
      fields.push(`hall = $${index++}`);
      values.push(event.hall);
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

    const result = await this.db.query(query, values);

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

  /**
   * Delete function for deleting blogs from the database.
   * This function deletes all blogs associated with a given event_id
   * @param event_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteBlogsWithEventID(event_id: number): Promise<void> {
    const query = `
      DELETE FROM blogs
        USING event_blogs
      WHERE blogs.id = event_blogs.blog_id
        AND event_blogs.event_id = $1
    `;

    await this.db.query(query, [event_id]);
  }

  /**
   * Delete function for deleting blogs from the database.
   * This function deletes a single blog-LINK associated with a given event_id
   * note: it does not delete the blog itself only from being linked to the given event.
   * @param event_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * @param blog_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteBlogFromEvent(event_id: number, blog_id: number): Promise<void> {
    const query = `
      DELETE FROM event_blogs
      WHERE event_blogs.blog_id = $1
        AND event_blogs.event_id = $2
    `;

    await this.db.query(query, [blog_id, event_id]);
  }

  /**
   * Link an existing blog to an event.
   * @param blog_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * @param event_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async linkBlogWithEventID(blog_id: number, event_id: number): Promise<void> {
    const query = `
      INSERT INTO event_blogs (event_id, blog_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;

    await this.db.query(query, [event_id, blog_id]);
  }
}
