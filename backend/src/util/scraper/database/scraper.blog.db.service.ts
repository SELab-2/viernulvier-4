import { Injectable } from "@nestjs/common";
import { ScraperDbService } from "./scraper.db.service";
import { Blog } from "@repo/common";

/**
 * note: There are no blogs used in the scraper.
 * However, this is used in the csv engine for csv parsing.
 */
@Injectable()
export class ScraperBlogDbService {
  constructor(private db: ScraperDbService) {}

  /**
   * Inserts a single blog row.
   * @param titel Localized blog title.
   * @param description Localized blog description.
   * @returns Inserted blog row.
   */
  async insertBlog(
    titel: { en: string; nl: string },
    description: { en: string; nl: string },
  ): Promise<Blog> {
    const rows = await this.db.query<Blog>(
      `
        INSERT INTO blogs (titel, description)
        VALUES ($1, $2)
        RETURNING *;
      `,
      [titel, description],
    );

    return rows[0];
  }

  /**
   * Links a blog to a production.
   * @param productionId Production id.
   * @param blogId Blog id.
   * @returns T/F Whether the link was created.
   */
  async linkBlog(productionId: number, blogId: number): Promise<boolean> {
    const rows = await this.db.query(
      `
        INSERT INTO production_blogs (production_id, blog_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [productionId, blogId],
    );

    return rows.length >= 1;
  }
}
