import { UtilsDbConnection } from "./database/scraper.db.service";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import { AppLogger } from "../logger/logger.service";

@Injectable()
@Command({
  name: "db:reset",
  description: "Will remove all data from the database but leave the tables.",
})
export class ResetDbCommand extends CommandRunner {
  constructor(
    private readonly logger: AppLogger,
    private readonly dbConnection: UtilsDbConnection,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    this.logger.warn("Nuking Database...");

    // NOTE: Doesn't delete accounts.
    try {
      await this.dbConnection.query(`
        TRUNCATE TABLE
          locations, event_locations, tags, production_tag, productions,
          events, event_prices, production_blogs, production_media_gallery,
          prices, blogs, blog_media_gallery, media_gallery,
          print_item_media_gallery, print_items, gallery_item,
          media_item, item_crop, media_crop, scraper_dates

        RESTART IDENTITY CASCADE;
      `);

      await this.dbConnection.query(`
        INSERT INTO scraper_dates DEFAULT VALUES;
      `);

      this.logger.log("Successfully nuked the database!");
    } catch (error) {
      this.logger.error(`Failed to nuke database: ${(error as Error).message}`);
      process.exit(1); // Exit with error code if it fails
    }
  }
}
