import { Pool, PoolClient, QueryResultRow } from "pg";
import {
  vnvEvent,
  vnvGallery,
  vnvGenre,
  vnvLocation,
  vnvMediaCrop,
  vnvMediaItem,
  vnvPrice,
  vnvProduction,
} from "../vnv.parser";
import {
  Production,
  Tag,
  Event,
  Price,
  Location,
  Blog,
  MediaCrop,
  MediaItem,
  MediaGallery,
} from "@repo/common";
import logger from "../../logger/logger";
import { ResourceGoneException } from "../../../common/exceptions";
import { Injectable, OnModuleDestroy } from "@nestjs/common";

/**
 * Holds the Connection to the database and important inserting functions.
 *
 * We defined this separate from the main connection that the backend uses to
 * communicate with the database for two main reasons.
 *  1: The Queries in here are highly specific to this use case and also allows
 *     insert of multiple languages at once (which the backend connection doesn't).
 *  2: If this connection to the database crashes for some reason, the one
 *     used in the backend isn't affected.
 *
 * In short: We chose to split the DB connections for backend and scraper to make
 *           sure there can be no confusions between the two and so they can't
 *           hinder each other either.
 */

export interface PendingCrops {
  batch: MediaCrop[];
  totalLeft: number;
}

@Injectable()
export class UtilsDbConnection implements OnModuleDestroy {
  /**
   * The Pool to the database, used to execute queries.
   */
  private pool: Pool;
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER_DEV,
      host: process.env.DB_HOST_DEV,
      database: process.env.DB_NAME_DEV,
      password: process.env.DB_PASSWORD_DEV,
      port: Number(process.env.DB_PORT_DEV),
    });
  }

  /**
   * Automatically destroy the database connection on stop.
   */
  async onModuleDestroy() {
    await this.pool.end();
  }

  /**
   * This function sends a query to the database.
   * @param query This is the to be executed query
   * @param params These are the possible parameters used in the query annotated by "$1",... as is convention in SQL.
   * @return a generic type that is a scheme of the database.
   * */
  async query<T extends QueryResultRow = any>(
    query: string,
    params?: any[],
    client?: PoolClient,
  ): Promise<T[]> {
    const runner: PoolClient | Pool = client || this.pool;
    try {
      const res = await runner.query<T>(query, params);
      return res.rows;
    } catch (error) {
      logger.error(
        `Database Query Failed: ${query}\nParams: ${JSON.stringify(params)}`,
        error,
      );
      throw error; // Let the caller know it failed!
    }
  }

  private async processInBatches<T>(
    label: string,
    items: T[],
    batchSize: number,
    processor: (item: T, client: any) => Promise<any>,
  ): Promise<void> {
    const total = items.length;
    if (total === 0) return;

    const startTime = Date.now();
    let completed = 0;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = items.slice(i, i + batchSize);

      // 1. Get a dedicated client from the pool
      const client = await this.pool.connect();

      try {
        await client.query("BEGIN");

        for (const item of chunk) {
          await processor(item, client);
          completed++;
        }

        await client.query("COMMIT");

        // Progress Log
        const percent = Math.floor((completed / total) * 100);
        const eta = this.calculateETA(startTime, completed, total);
        logger.info(
          `[BATCH DB] ${label}: ${percent}% (${completed}/${total}) | ETA: ${eta}`,
        );
      } catch (error) {
        await client.query("ROLLBACK");
        logger.error(
          `[BATCH ERROR] Failed at index ${i}. Batch rolled back.`,
          error,
        );
        throw error; // Stop the whole scraper if the DB is failing
      } finally {
        client.release();
      }
    }
  }

  /**
   * Calculates the ETA of a network action.
   * @param startTime The starting time of the action.
   * @param current The current items.
   * @param total The total items.
   * @returns A time string.
   */
  private calculateETA(
    startTime: number,
    current: number,
    total: number,
  ): string {
    if (current === 0) return "Calculating...";

    const elapsed = Date.now() - startTime; // ms spent so far
    const msPerItem = elapsed / current;
    const remainingItems = total - current;
    const remainingMs = remainingItems * msPerItem;

    // Convert MS to a nice string like "2m 30s"
    const seconds = Math.floor((remainingMs / 1000) % 60);
    const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  /**
   * Fetches a production by legacy id.
   * @param legacyId The production legacy id.
   * @returns The production row.
   */
  async getProductionByLegacyId(legacyId: string): Promise<Production> {
    if (!legacyId || !legacyId.trim()) {
      throw new Error("legacyId is required to fetch a production");
    }

    const rows = await this.query<Production>(
      `SELECT * FROM productions WHERE legacy_id = $1 LIMIT 1;`,
      [legacyId],
    );

    if (rows.length === 0) {
      throw new ResourceGoneException(
        `No Production exists for provided legacy_id(${legacyId})`,
      );
    }

    return rows[0];
  }

  /**
   * Fetches an event by legacy id.
   * @param legacyId The event legacy id.
   * @returns The event row.
   */
  async getEventByLegacyId(legacyId: string): Promise<Event> {
    if (!legacyId || !legacyId.trim()) {
      throw new Error("legacyId is required to fetch an event");
    }

    const rows = await this.query<Event>(
      `SELECT * FROM events WHERE legacy_id = $1 LIMIT 1;`,
      [legacyId],
    );

    if (rows.length === 0) {
      throw new ResourceGoneException(
        `No Event exists for provided legacy_id(${legacyId})`,
      );
    }

    return rows[0];
  }

  /**
   * Productions.
   */

  /**
   * Inserts a list of vnvProduction objects.
   * @param productions The list of vnvProductions.
   */
  async insertProductions(productions: vnvProduction[]) {
    await this.processInBatches(
      "Productions",
      productions,
      500,
      (p: vnvProduction, client: PoolClient) =>
        this.insertProduction(p, client),
    );
  }

  /**
   * Tags
   */

  /**
   * Inserts a list of vnvGenre objects into Tags.
   * @param genres The list of vnvGenre objects.
   */
  async insertTags(genres: vnvGenre[]) {
    await this.processInBatches(
      "Tags",
      genres,
      500,
      (g: vnvGenre, client: PoolClient) => this.insertTag(g, client),
    );
  }

  /**
   * Inserts a list of vnvEvent objects into the database.
   * @param events The list of vnvEvent objects.
   */
  async insertEvents(events: vnvEvent[]) {
    await this.processInBatches(
      "Events",
      events,
      500,
      (e: vnvEvent, client: PoolClient) => this.insertEvent(e, client),
    );
  }

  /**
   * Inserts a list of vnvLocation objects.
   * @param locations The list of vnvLocation objects.
   */
  async insertLocations(locations: vnvLocation[]) {
    await this.processInBatches(
      "Locations",
      locations,
      500,
      (l: vnvLocation, client: PoolClient) => this.insertLocation(l, client),
    );
  }

  /**
   * Insert a list of vnvPrice objects.
   * @param prices The list of vnvPrice objects.
   */
  async insertPrices(prices: vnvPrice[]) {
    await this.processInBatches(
      "Prices",
      prices,
      500,
      (p: vnvPrice, client: PoolClient) => this.insertPrice(p, client),
    );
  }

  /**
   * Inserts a list of vnvMediaCrop objects.
   * @param crops The list of vnvMediaCrop objects.
   */
  async insertCrops(crops: vnvMediaCrop[]) {
    await this.processInBatches(
      "Crops",
      crops,
      500,
      (c: vnvMediaCrop, client: PoolClient) => this.insertCrop(c, client),
    );
  }

  /**
   * Inserts a list of vnvMediaItem objects.
   * @param items The list of vnvMediaItem objects.
   */
  async insertItems(items: vnvMediaItem[]) {
    await this.processInBatches(
      "Items",
      items,
      500,
      (i: vnvMediaItem, client: PoolClient) => this.insertItem(i, client),
    );
  }

  /**
   * Inserts a list of vnvGallery objects.
   * @param galleries The list of vnvGallery objects.
   */
  async insertGalleries(galleries: vnvGallery[]) {
    await this.processInBatches(
      "Galleries",
      galleries,
      500,
      (g: vnvGallery, client: PoolClient) => this.insertGallery(g, client),
    );
  }

  /**
   * Events
   */

  /**
   * Inserts a Production by it's legacy_id or creates a new one.
   * Also links it's respective tags.
   * @param vnvProduction The vnvProduction we want to add.
   * @returns T/F Whether the change went through or not.
   */
  async insertProduction(
    vnvProduction: vnvProduction,
    client?: PoolClient,
  ): Promise<Production> {
    const query = `
      INSERT INTO productions (
        titel, description1, description2, artist, 
        tagline, credits, legacy_id, performer_type, attendance_mode
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (legacy_id)
      DO UPDATE SET
        titel = EXCLUDED.titel,
        description1 = EXCLUDED.description1,
        description2 = EXCLUDED.description2,
        artist = EXCLUDED.artist,
        tagline = EXCLUDED.tagline,
        credits = EXCLUDED.credits,
        performer_type = EXCLUDED.performer_type,
        attendance_mode = EXCLUDED.attendance_mode
      RETURNING *;
    `;

    const values = [
      vnvProduction.title,
      vnvProduction.description,
      vnvProduction.description_2,
      vnvProduction.artist,
      vnvProduction.tagline,
      vnvProduction.info,
      vnvProduction.legacy_id,
      vnvProduction.performer_type,
      vnvProduction.attendance_mode,
    ];

    const output: Production[] = await this.query<Production>(
      query,
      values,
      client,
    );
    const production: Production = output[0];

    // First we unlink all current tags.
    await this.query(
      `
        DELETE FROM production_tag WHERE production_id = $1;
      `,
      [production.id],
      client,
    );

    // Now we have to link the tags.
    const tags: Tag[] = await this.query<Tag>(
      `
        SELECT * FROM tags
        WHERE legacy_id = ANY($1::text[]);
      `,
      [vnvProduction.genres],
      client,
    );
    for (const tag of tags) {
      const valid: boolean = await this.linkTag(production.id, tag.id, client);
      if (!valid)
        logger.warn(
          `Failed to link Tag(${tag.id}) to Production(${production.id}).`,
        );
    }

    // Then we unlink the gallery.
    await this.query(
      `
        DELETE FROM production_media_gallery WHERE production_id = $1;
      `,
      [production.id],
      client,
    );
    const galleries: MediaGallery[] = await this.query<MediaGallery>(
      `
        SELECT * FROM media_gallery
        WHERE legacy_id = $1;
      `,
      [vnvProduction.galleryId],
      client,
    );

    // And we link it.
    if (galleries.length) {
      const gallery: MediaGallery = galleries[0];
      const valid = await this.linkGallery(gallery.id, production.id, client);
      if (!valid)
        logger.warn(
          `Failed to link Gallery(${gallery.id}) to Production(${production.id}).`,
        );
    }

    return production;
  }

  /**
   * Inserts/Updates a single tag into the database based
   * on it's legacy_id.
   * @param genre The vnvGenre that is to be turned into a Tag.
   * @returns The ID of the Tag.
   */
  async insertTag(genre: vnvGenre, client?: PoolClient): Promise<number> {
    const query = `
      INSERT INTO tags (tag, legacy_id)
      VALUES ($1, $2)
      ON CONFLICT (legacy_id) 
      DO UPDATE SET tag = EXCLUDED.tag
      RETURNING *;
    `;
    const values = [genre.name, genre.legacy_id];
    const output: Tag[] = await this.query<Tag>(query, values, client);
    return output[0].id;
  }

  /**
   * Locations
   */

  /**
   * Link a Tag to a Production in the database.
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns T/F Whether the link was created.
   */
  async linkTag(
    productionId: number,
    tagId: number,
    client?: PoolClient,
  ): Promise<boolean> {
    const query = `
      INSERT INTO production_tag (production_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.query(query, [productionId, tagId], client);
    return output.length >= 1;
  }

  /**
   * Links a Gallery to a Production.
   * @param galleryId Item id.
   * @param productionId Crop id.
   * @returns T/F Whether the link was created.
   */
  async linkGallery(
    galleryId: number,
    productionId: number,
    client?: PoolClient,
  ): Promise<boolean> {
    const rows = await this.query(
      `
        INSERT INTO production_media_gallery (production_id, gallery_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [productionId, galleryId],
      client,
    );

    return rows.length >= 1;
  }

  /**
   * Insert a single vnvEvent into the database by it's legacy_id.
   * Also links the appropriate Price objects and Location object.
   * @param vnvEvent The particular vnvEvent.
   * @returns Nothing.
   */
  async insertEvent(vnvEvent: vnvEvent, client?: PoolClient) {
    const productions: Production[] = await this.query<Production>(
      `SELECT * from productions WHERE legacy_id = $1;`,
      [vnvEvent.production_id],
      client,
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

    const output: Event[] = await this.query<Event>(query, values, client);
    const event: Event = output[0];

    // We first unlink the existing Prices so we can replace the links.
    await this.query(
      `
        DELETE FROM event_prices WHERE event_id = $1;
      `,
      [event.id],
      client,
    );

    // Now we link the correct prices again.
    const prices: Price[] = await this.query<Price>(
      `
        SELECT * FROM prices
        WHERE legacy_id = ANY($1::text[]);
      `,
      [vnvEvent.prices],
      client,
    );
    for (const price of prices) {
      const valid: boolean = await this.linkPrice(event.id, price.id, client);
      if (!valid)
        logger.warn(`Failed to link Price(${price.id}) to Event(${event.id}).`);
    }

    // We also replace the Event location.
    await this.query(
      `
        DELETE FROM event_locations WHERE event_id = $1;
      `,
      [event.id],
      client,
    );
    // We also need to link the Event location.
    const locations: Location[] = await this.query<Location>(
      `
        SELECT * FROM locations
        WHERE legacy_id = $1;
      `,
      [vnvEvent.location],
      client,
    );

    if (locations.length) {
      const location: Location = locations[0];
      const valid: boolean = await this.linkLocation(
        event.id,
        location.id,
        client,
      );
      if (!valid)
        logger.warn(
          `Failed to link Location(${location.id}) to Event(${event.id}).`,
        );
    }
  }

  /**
   * Inserts a single vnvLocation into the database.
   * @param location The location we want inserted.
   * @returns Nothing.
   */
  async insertLocation(location: vnvLocation, client?: PoolClient) {
    const query = `
      INSERT INTO locations (location, legacy_id)
      VALUES ($1, $2)
      ON CONFLICT (legacy_id)
      DO UPDATE SET location = EXCLUDED.location
      RETURNING *;
    `;
    await this.query<Location>(
      query,
      [location.name, location.legacy_id],
      client,
    );
  }

  /**
   * Price.
   */

  /**
   * Links an Event and a Location by their ids.
   * @param eventId The Event ID.
   * @param locationId The Location ID.
   * @returns T/F Whether it Failed or not.
   */
  async linkLocation(
    eventId: number,
    locationId: number,
    client?: PoolClient,
  ): Promise<boolean> {
    const query = `
      INSERT INTO event_locations (event_id, location_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.query(query, [eventId, locationId], client);
    return output.length >= 1;
  }

  /**
   * Insert a single vnvPrice into the database.
   * @param price The vnvPrice object we want inserted.
   * @returns Nothing.
   */
  async insertPrice(price: vnvPrice, client?: PoolClient): Promise<Price> {
    const query = `
      INSERT INTO prices (name, price, legacy_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (legacy_id)
      DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price
      RETURNING *;
    `;
    const rows = await this.query<Price>(
      query,
      [price.name, price.amount, price.legacy_id],
      client,
    );
    return rows[0];
  }

  /**
   * Link a Price to an Event.
   * @param eventId The Event ID.
   * @param priceId The Price ID.
   * @returns T/F Whether it Failed or not.
   */
  async linkPrice(
    eventId: number,
    priceId: number,
    client?: PoolClient,
  ): Promise<boolean> {
    const query = `
      INSERT INTO event_prices (event_id, price_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.query(query, [eventId, priceId], client);
    return output.length >= 1;
  }

  /**
   * Blogs.
   */

  /**
   * Inserts a single blog row.
   * @param titel Localized blog title.
   * @param description Localized blog description.
   * @returns Inserted blog row.
   */
  async insertBlog(
    titel: { en: string; nl: string },
    description: { en: string; nl: string },
    client?: PoolClient,
  ): Promise<Blog> {
    const rows = await this.query<Blog>(
      `
        INSERT INTO blogs (titel, description)
        VALUES ($1, $2)
        RETURNING *;
      `,
      [titel, description],
      client,
    );

    return rows[0];
  }

  /**
   * Links a blog to a production.
   * @param productionId Production id.
   * @param blogId Blog id.
   * @returns T/F Whether the link was created.
   */
  async linkBlog(
    productionId: number,
    blogId: number,
    client?: PoolClient,
  ): Promise<boolean> {
    const rows = await this.query(
      `
        INSERT INTO production_blogs (production_id, blog_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [productionId, blogId],
      client,
    );

    return rows.length >= 1;
  }

  /**
   * Media
   */

  /**
   * Inserts a vnvCrop into the database.
   * @param crop The vnvCrop object.
   * @param client The optional client to do transactions with.
   * @returns The inserted crop.
   */
  async insertCrop(
    crop: vnvMediaCrop,
    client?: PoolClient,
  ): Promise<MediaCrop> {
    const query = `
      INSERT INTO media_crop (
        legacy_id, name, url
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (legacy_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        url = EXCLUDED.url
      RETURNING *;
    `;

    const result = await this.query<MediaCrop>(
      query,
      [crop.legacy_id, crop.name, crop.url],
      client,
    );

    return result[0];
  }

  /**
   * Inserts a single vnvItem into the database
   * @param item The vnvItem to insert.
   * @param client Optional client for transactions.
   * @returns The inserted Item.
   */
  async insertItem(
    item: vnvMediaItem,
    client?: PoolClient,
  ): Promise<MediaItem> {
    const query = `
      INSERT INTO media_item (
        legacy_id, type, original_filename, position,
        width, height, credits, description, title
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (legacy_id)
      DO UPDATE SET
        type = EXCLUDED.type,
        original_filename = EXCLUDED.original_filename,
        position = EXCLUDED.position,
        width = EXCLUDED.width,
        height = EXCLUDED.height,
        credits = EXCLUDED.credits,
        description = EXCLUDED.description,
        title = EXCLUDED.title
      RETURNING *;
    `;

    // First upload the item.
    const result = await this.query<MediaItem>(
      query,
      [
        item.legacy_id,
        item.type,
        item.original_filename,
        item.position,
        item.width,
        item.height,
        item.credits,
        item.description,
        item.title,
      ],
      client,
    );
    const realItem: MediaItem = result[0];

    // Firstly delete all previous crops.
    await this.query(
      `
        DELETE FROM item_crop WHERE item_id = $1;
      `,
      [realItem.id],
      client,
    );

    const crops: MediaCrop[] = await this.query<MediaCrop>(
      `
        SELECT * FROM media_crop
        WHERE legacy_id = ANY($1::text[]);
      `,
      [item.crops],
      client,
    );

    // Link the crops.
    for (const crop of crops) {
      const valid: boolean = await this.linkCrop(realItem.id, crop.id, client);
      if (!valid)
        logger.warn(`Failed to link Crop(${crop.id}) to Item(${realItem.id}).`);
    }

    return realItem;
  }

  /**
   * Links a Crop to an Item.
   * @param itemId Item id.
   * @param cropId Crop id.
   * @returns T/F Whether the link was created.
   */
  async linkCrop(
    itemId: number,
    cropId: number,
    client?: PoolClient,
  ): Promise<boolean> {
    const rows = await this.query(
      `
        INSERT INTO item_crop (item_id, crop_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [itemId, cropId],
      client,
    );

    return rows.length >= 1;
  }

  /**
   * Insert a vnvGallery into the database.
   * @param gallery The gallery in question.
   * @param client The client for batching and transactions.
   * @returns The inserted Gallery.
   */
  async insertGallery(
    gallery: vnvGallery,
    client?: PoolClient,
  ): Promise<MediaGallery> {
    const query = `
      INSERT INTO media_gallery (
        legacy_id, name, type
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (legacy_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type
      RETURNING *;
    `;

    const result = await this.query<MediaGallery>(
      query,
      [gallery.legacy_id, gallery.name, gallery.type],
      client,
    );
    const realGallery: MediaGallery = result[0];

    // Firstly delete all previous items.
    await this.query(
      `
        DELETE FROM gallery_item WHERE gallery_id = $1;
      `,
      [realGallery.id],
      client,
    );

    const items: MediaItem[] = await this.query<MediaItem>(
      `
        SELECT * FROM media_item
        WHERE legacy_id = ANY($1::text[]);
      `,
      [gallery.items],
      client,
    );

    // Link the items.
    for (const item of items) {
      const valid: boolean = await this.linkItem(
        realGallery.id,
        item.id,
        client,
      );
      if (!valid)
        logger.warn(
          `Failed to link Item(${item.id}) to Gallery(${realGallery.id}).`,
        );
    }

    return realGallery;
  }

  /**
   * Links a Item to a Gallery.
   * @param galleryId Item id.
   * @param itemId Crop id.
   * @returns T/F Whether the link was created.
   */
  async linkItem(
    galleryId: number,
    itemId: number,
    client?: PoolClient,
  ): Promise<boolean> {
    const rows = await this.query(
      `
        INSERT INTO gallery_item (gallery_id, item_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [galleryId, itemId],
      client,
    );

    return rows.length >= 1;
  }

  /**
   * Returns a list of non-downloaded crops.
   * This list is of length "amount" and randomly sorted each time.
   * @param amount The amount of crops to fetch.
   * @returns The list of crops of max amount and the total remaining pending crops.
   */
  async getPendingCrops(amount: number): Promise<PendingCrops> {
    const cropsQuery = `
      SELECT id, name, url, created_at, updated_at FROM media_crop
      WHERE url NOT LIKE '${process.env.MEDIA_BASE_URL}%'
      ORDER BY random()
      LIMIT $1;
    `;
    const countQuery = `
      SELECT COUNT(*) as count FROM media_crop
      WHERE url NOT LIKE '${process.env.MEDIA_BASE_URL}%';
    `;

    const [batch, totalLeft] = await Promise.all([
      this.query<MediaCrop>(cropsQuery, [amount]),
      this.query<{ count: string }>(countQuery, []),
    ]);

    return {
      batch,
      totalLeft: parseInt(totalLeft[0].count),
    };
  }

  /**
   * Updates a crop with the processed URL.
   * @param crop_id The crop ID.
   * @param url The URL to insert into the crop.
   * @returns The updated crop.
   */
  async updateCropWithOwnUrl(crop_id: number, url: string): Promise<MediaCrop> {
    const updateCropQuery = `
      UPDATE media_crop
      SET url = $1
      WHERE id = $2
      RETURNING id, name, url, created_at, updated_at;
    `;

    const crops: MediaCrop[] = await this.query<MediaCrop>(updateCropQuery, [
      url,
      crop_id,
    ]);

    return crops[0];
  }
}
