import { Injectable } from "@nestjs/common";
import { UtilsDbConnection } from "./scraper.db.service";
import { MediaGallery, Production, Tag } from "@repo/common";
import { ResourceGoneException } from "../../../common/exceptions";
import { vnvProduction } from "../vnv.parser";
import logger from "../../logger/logger";

@Injectable()
export class ScraperProductionDbService {
  constructor(private db: UtilsDbConnection) {}

  /**
   * Fetches a production by legacy id.
   * @param legacyId The production legacy id.
   * @returns The production row.
   */
  async getProductionByLegacyId(legacyId: string): Promise<Production> {
    if (!legacyId || !legacyId.trim()) {
      throw new Error("legacyId is required to fetch a production");
    }

    const rows = await this.db.query<Production>(
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
   * Inserts a list of vnvProduction objects.
   * @param productions The list of vnvProductions.
   */
  async insertProductions(productions: vnvProduction[]) {
    await this.db.processInBatches(
      "Productions",
      productions,
      500,
      (p: vnvProduction) => this.insertProduction(p),
    );
  }

  /**
   * Inserts a Production by it's legacy_id or creates a new one.
   * Also links it's respective tags.
   * @param vnvProduction The vnvProduction we want to add.
   * @returns T/F Whether the change went through or not.
   */
  async insertProduction(vnvProduction: vnvProduction): Promise<Production> {
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

    const output: Production[] = await this.db.query<Production>(query, values);
    const production: Production = output[0];

    // First we unlink all current tags.
    await this.db.query(
      `
        DELETE FROM production_tag WHERE production_id = $1;
      `,
      [production.id],
    );

    // Now we have to link the tags.
    const tags: Tag[] = await this.db.query<Tag>(
      `
        SELECT * FROM tags
        WHERE legacy_id = ANY($1::text[]);
      `,
      [vnvProduction.genres],
    );
    for (const tag of tags) {
      const valid: boolean = await this.linkTag(production.id, tag.id);
      if (!valid)
        logger.warn(
          `Failed to link Tag(${tag.id}) to Production(${production.id}).`,
        );
    }

    // Then we unlink the gallery.
    await this.db.query(
      `
        DELETE FROM production_media_gallery WHERE production_id = $1;
      `,
      [production.id],
    );
    const galleries: MediaGallery[] = await this.db.query<MediaGallery>(
      `
        SELECT * FROM media_gallery
        WHERE legacy_id = $1;
      `,
      [vnvProduction.galleryId],
    );

    // And we link it.
    if (galleries.length) {
      const gallery: MediaGallery = galleries[0];
      const valid = await this.linkGallery(gallery.id, production.id);
      if (!valid)
        logger.warn(
          `Failed to link Gallery(${gallery.id}) to Production(${production.id}).`,
        );
    }

    return production;
  }

  /**
   * Link a Tag to a Production in the database.
   *
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns T/F Whether the link was created.
   */
  async linkTag(productionId: number, tagId: number): Promise<boolean> {
    const query = `
      INSERT INTO production_tag (production_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const output = await this.db.query(query, [productionId, tagId]);
    return output.length >= 1;
  }

  /**
   * Links a Gallery to a Production.
   * @param galleryId Item id.
   * @param productionId Crop id.
   * @returns T/F Whether the link was created.
   */
  async linkGallery(galleryId: number, productionId: number): Promise<boolean> {
    const rows = await this.db.query(
      `
        INSERT INTO production_media_gallery (production_id, gallery_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [productionId, galleryId],
    );

    return rows.length >= 1;
  }
}
