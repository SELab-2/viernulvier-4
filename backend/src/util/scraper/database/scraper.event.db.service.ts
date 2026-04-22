import { Injectable } from "@nestjs/common";
import { ScraperDbService } from "./scraper.db.service";
import { ResourceNotFoundException } from "../../../common/exceptions";
import { vnvEvent } from "../vnv.parser";
import logger from "../../logger/logger";
import { Event, Location, Price, Production } from "@repo/common";
import { ProductionDto } from "../../../dto/dto";

/**
 * Events db service for the scraper & csv parser.
 * This object handles the insertion of events
 * & the linking of locations and prices to the events.
 */
@Injectable()
export class ScraperEventDbService {
  constructor(private db: ScraperDbService) {}

  /**
   * Fetches an event by legacy id.
   * @param legacyId The event legacy id.
   * @returns The event row.
   */
  async getEventByLegacyId(legacyId: string): Promise<Event> {
    if (!legacyId || !legacyId.trim()) {
      throw new Error("legacyId is required to fetch an event");
    }

    const rows = await this.db.query<Event>(
      `SELECT * FROM events WHERE legacy_id = $1 LIMIT 1;`,
      [legacyId],
    );

    if (rows.length === 0) {
      throw new ResourceNotFoundException(ProductionDto, legacyId);
    }

    return rows[0];
  }

  /**
   * Inserts a list of vnvEvent objects into the database.
   * @param events The list of vnvEvent objects.
   */
  async insertEvents(events: vnvEvent[]) {
    await this.db.processInBatches("Events", events, 500, (e: vnvEvent) =>
      this.insertEvent(e),
    );
  }

  /**
   * Insert a single vnvEvent into the database by it's legacy_id.
   * Also links the appropriate Price objects and Location object.
   * @param vnvEvent The particular vnvEvent.
   * @returns Nothing.
   */
  async insertEvent(vnvEvent: vnvEvent) {
    const productions: Production[] = await this.db.query<Production>(
      `SELECT * from productions WHERE legacy_id = $1;`,
      [vnvEvent.production_id],
    );

    if (productions.length === 0) {
      logger.warn(
        `Could not find Production(${vnvEvent.production_id}) to link Event(${vnvEvent.legacy_id}) with.`,
      );
      return;
    }
    const productionId: number = productions[0].id;

    // 2. Upsert the Event
    const query = `
      INSERT INTO events (
        starttime, endtime, doors_at, intermission_at, production_id, legacy_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (legacy_id)
      DO UPDATE SET
        starttime = EXCLUDED.starttime,
        endtime = EXCLUDED.endtime,
        doors_at = EXCLUDED.doors_at,
        intermission_at = EXCLUDED.intermission_at,
        production_id = EXCLUDED.production_id
      RETURNING *;
    `;
    const values = [
      vnvEvent.starts_at,
      vnvEvent.ends_at,
      vnvEvent.doors_at,
      vnvEvent.intermission_at,
      productionId,
      vnvEvent.legacy_id,
    ];

    const output: Event[] = await this.db.query<Event>(query, values);
    const event: Event = output[0];

    // We first unlink the existing Prices so we can replace the links.
    await this.db.query(
      `
        DELETE FROM event_prices WHERE event_id = $1;
      `,
      [event.id],
    );

    // Now we link the correct prices again.
    const prices: Price[] = await this.db.query<Price>(
      `
        SELECT * FROM prices
        WHERE legacy_id = ANY($1::text[]);
      `,
      [vnvEvent.prices],
    );
    for (const price of prices) {
      const valid: boolean = await this.linkPrice(event.id, price.id);
      if (!valid)
        logger.warn(`Failed to link Price(${price.id}) to Event(${event.id}).`);
    }

    // We also replace the Event location.
    await this.db.query(
      `
        DELETE FROM event_locations WHERE event_id = $1;
      `,
      [event.id],
    );
    // We also need to link the Event location.
    const locations: Location[] = await this.db.query<Location>(
      `
        SELECT * FROM locations
        WHERE legacy_id = $1;
      `,
      [vnvEvent.location],
    );

    if (locations.length) {
      const location: Location = locations[0];
      const valid: boolean = await this.linkLocation(event.id, location.id);
      if (!valid)
        logger.warn(
          `Failed to link Location(${location.id}) to Event(${event.id}).`,
        );
    }
  }

  /**
   * Links an Event and a Location by their ids.
   * @param eventId The Event ID.
   * @param locationId The Location ID.
   * @returns T/F Whether it Failed or not.
   */
  async linkLocation(eventId: number, locationId: number): Promise<boolean> {
    const query = `
      INSERT INTO event_locations (event_id, location_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.db.query(query, [eventId, locationId]);
    return output.length >= 1;
  }

  /**
   * Link a Price to an Event.
   * @param eventId The Event ID.
   * @param priceId The Price ID.
   * @returns T/F Whether it Failed or not.
   */
  async linkPrice(eventId: number, priceId: number): Promise<boolean> {
    const query = `
      INSERT INTO event_prices (event_id, price_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.db.query(query, [eventId, priceId]);
    return output.length >= 1;
  }
}
