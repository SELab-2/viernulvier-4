import { BadRequestException, Injectable } from "@nestjs/common";
import type { Blog, CreateEvent, Event, UpdateEvent } from "@repo/common";
import { EventDatabaseService } from "../database/db.event.service";
import { BlogDatabaseService } from "src/database/db.blog.service";

@Injectable()
export class EventService {
  constructor(
    private readonly eventDBService: EventDatabaseService,
    private readonly blogDBService: BlogDatabaseService
  ) {}

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
  async getEventById(id: number): Promise<Event> {
    return await this.eventDBService.getEventById(id);
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

    return await this.eventDBService.updateEvent(event);
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

    return await this.eventDBService.updateEvent(mergedEvent);
  }

  /**
   * Deletes an event from the database.
   * @param id ID of the Event we want to delete.
   * @returns Nothing.
   */
  async deleteEvent(id: number): Promise<void> {
    await this.eventDBService.deleteEvent(id);
    return;
  }

  /**
   * Creates an Event and adds it to the database
   * @param newEvent The new Event data we want to add
   * @returns The newly created Event.
   */
  async createEvent(newEvent: CreateEvent): Promise<Event> {
    return await this.eventDBService.createEvent(newEvent);
  }

  // -- Blogs -- //

  /**
   * Returns all Blog objects linked to an Event.
   * @param eventId The ID of the Event.
   * @returns A list of Blogs.
   */
  async getEventBlogs(eventId: number): Promise<Blog[]> {
    return await this.eventDBService.getBlogsOfEvent(eventId);
  }

  /**
   * Links a Blog to an Event.
   * @param eventId The ID of the Event in question.
   * @param blogId The ID of the Blog in question.
   * @returns The Blog that was just linked to the Event.
   */
  async linkBlogToEvent(eventId: number, blogId: number): Promise<Blog> {
    await this.eventDBService.linkBlogWithEventID(blogId, eventId);
    return await this.blogDBService.getBlogById(blogId);
  }

  /**
   * Unlinks a Blog from an Event.
   * @param eventId The ID of the Event in question.
   * @param blogId The ID of the Blog in question.
   * @returns The Event the Blog was unlinked from.
   */
  async unlinkBlogFromEvent(eventId: number, blogId: number): Promise<Event> {
    await this.eventDBService.deleteBlogFromEvent(eventId, blogId);
    return await this.eventDBService.getEventById(eventId);
  } 
}
