import { Injectable } from "@nestjs/common";
import { UtilsDbConnection } from "./scraper.db.service";
import logger from "../../logger/logger";
import { vnvGallery, vnvMediaCrop, vnvMediaItem } from "../vnv.parser";
import { MediaCrop, MediaGallery, MediaItem } from "@repo/common";
import { ConfigService } from "@nestjs/config";

export interface PendingCrops {
  batch: MediaCrop[];
  totalLeft: number;
}

@Injectable()
export class ScraperMediaDbService {
  constructor(
    private readonly configService: ConfigService,
    private db: UtilsDbConnection,
  ) {}

  /**
   * Inserts a list of vnvMediaCrop objects.
   * @param crops The list of vnvMediaCrop objects.
   */
  async insertCrops(crops: vnvMediaCrop[]) {
    await this.db.processInBatches("Crops", crops, 500, (c: vnvMediaCrop) =>
      this.insertCrop(c),
    );
  }

  /**
   * Inserts a list of vnvMediaItem objects.
   * @param items The list of vnvMediaItem objects.
   */
  async insertItems(items: vnvMediaItem[]) {
    await this.db.processInBatches("Items", items, 500, (i: vnvMediaItem) =>
      this.insertItem(i),
    );
  }

  /**
   * Inserts a list of vnvGallery objects.
   * @param galleries The list of vnvGallery objects.
   */
  async insertGalleries(galleries: vnvGallery[]) {
    await this.db.processInBatches(
      "Galleries",
      galleries,
      500,
      (g: vnvGallery) => this.insertGallery(g),
    );
  }

  /**
   * Inserts a vnvCrop into the database.
   * @param crop The vnvCrop object.
   * @returns The inserted crop.
   */
  async insertCrop(crop: vnvMediaCrop): Promise<MediaCrop> {
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

    const result = await this.db.query<MediaCrop>(query, [
      crop.legacy_id,
      crop.name,
      crop.url,
    ]);

    return result[0];
  }

  /**
   * Inserts a single vnvItem into the database
   * @param item The vnvItem to insert.
   * @returns The inserted Item.
   */
  async insertItem(item: vnvMediaItem): Promise<MediaItem> {
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
    const result = await this.db.query<MediaItem>(query, [
      item.legacy_id,
      item.type,
      item.original_filename,
      item.position,
      item.width,
      item.height,
      item.credits,
      item.description,
      item.title,
    ]);
    const realItem: MediaItem = result[0];

    // Firstly delete all previous crops.
    await this.db.query(
      `
        DELETE FROM item_crop WHERE item_id = $1;
      `,
      [realItem.id],
    );

    const crops: MediaCrop[] = await this.db.query<MediaCrop>(
      `
        SELECT * FROM media_crop
        WHERE legacy_id = ANY($1::text[]);
      `,
      [item.crops],
    );

    // Link the crops.
    for (const crop of crops) {
      const valid: boolean = await this.linkCrop(realItem.id, crop.id);
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
  async linkCrop(itemId: number, cropId: number): Promise<boolean> {
    const rows = await this.db.query(
      `
        INSERT INTO item_crop (item_id, crop_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [itemId, cropId],
    );

    return rows.length >= 1;
  }

  /**
   * Insert a vnvGallery into the database.
   * @param gallery The gallery in question.
   * @returns The inserted Gallery.
   */
  async insertGallery(gallery: vnvGallery): Promise<MediaGallery> {
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

    const result = await this.db.query<MediaGallery>(query, [
      gallery.legacy_id,
      gallery.name,
      gallery.type,
    ]);
    const realGallery: MediaGallery = result[0];

    // Firstly delete all previous items.
    await this.db.query(
      `
        DELETE FROM gallery_item WHERE gallery_id = $1;
      `,
      [realGallery.id],
    );

    const items: MediaItem[] = await this.db.query<MediaItem>(
      `
        SELECT * FROM media_item
        WHERE legacy_id = ANY($1::text[]);
      `,
      [gallery.items],
    );

    // Link the items.
    for (const item of items) {
      const valid: boolean = await this.linkItem(realGallery.id, item.id);
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
  async linkItem(galleryId: number, itemId: number): Promise<boolean> {
    const rows = await this.db.query(
      `
        INSERT INTO gallery_item (gallery_id, item_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [galleryId, itemId],
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
      WHERE url NOT LIKE '${this.configService.get<string>("MEDIA_BASE_URL")}%'
        AND trim(url) != ''
      ORDER BY random()
      LIMIT $1;
    `;
    const countQuery = `
      SELECT COUNT(*) as count FROM media_crop
      WHERE url NOT LIKE '${this.configService.get<string>("MEDIA_BASE_URL")}%'
        AND trim(url) != '';
    `;

    const [batch, totalLeft] = await Promise.all([
      this.db.query<MediaCrop>(cropsQuery, [amount]),
      this.db.query<{ count: string }>(countQuery, []),
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

    const crops: MediaCrop[] = await this.db.query<MediaCrop>(updateCropQuery, [
      url,
      crop_id,
    ]);

    return crops[0];
  }
}
