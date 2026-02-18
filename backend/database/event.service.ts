import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { EventSchema } from "../../common/src/database_objects";

@Injectable()
export class EventDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  // generic GET function (used only as intermediary end-point)
  // TODO add price filtering?
  async getEvents(
    filters: Partial<{
      genre: string;
      date: string;
      hall: string;
      id: number;
    }>,
  ): Promise<EventSchema[]> {
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
    // can be split between start and end. TODO -> discuss this
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

    // add more filters here if needed.

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // p is defined, ignore error
    const query = `
      SELECT e.id, e.starttime, e.endtime, e.hall, e.production_id, e.price
      FROM events e
        JOIN productions p ON e.production_id = p.id 
          ${whereClause}
      ORDER BY e.starttime
        `;

    return this.db.query<EventSchema>(query, values);
  }

  // generic PUT function (used only as intermediary end-point)
  async createEvent(event: Omit<EventSchema, "id">): Promise<EventSchema> {
    // Validate input, throw error if not all
    if (!event.starttime || !event.hall || !event.production_id) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO events (starttime, endtime, hall, production_id, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, starttime, endtime, hall, production_id, price
    `;

    const result = await this.db.query<EventSchema>(query, [
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

  // generic POST function
  async updateEvent(event: Omit<EventSchema, "id">): Promise<EventSchema> {
    // TODO this needed?
    return new Promise(async (resolve, reject) => {});
  }

  // generic DELETE function
  async deleteEvent(id: number, date: string): Promise<EventSchema> {
    // TODO this needed?
    // + wouldnt work on id would need id and date?
    return new Promise(async (resolve, reject) => {});
  }
}
