import { ScraperEngine, ScrapeResult } from "./scraper.engine";
import { Injectable } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import { MediaCrop } from "@repo/common";
import { UtilsDbConnection } from "./database/scraper.db.service";
import { ScraperDbFacade } from "./database/scraper.db.facade";
import { PendingCrops } from "./database/scraper.media.db.service";

/**
 * This class is the scraper runner.
 * This runs the scraper and acts as the main-entrypoiny of the scraper.
 * note: all scraper logic is in the Scraper engine. (here only insertion.)
 */
@Injectable()
export class ScraperRunner {
  constructor(
    private readonly scraperEngine: ScraperEngine,
    private readonly logger: AppLogger,
    private readonly dbConnection: UtilsDbConnection,
    private readonly db: ScraperDbFacade,
  ) {}

  /**
   * Main entrypoint of the worker.
   */
  async runScraper() {
    // Fetch the last scraped date.
    const dates = await this.dbConnection.query(
      `
        SELECT date FROM scraper_dates ORDER BY date DESC LIMIT 1;
      `,
    );
    const date: string = (dates[0] as Record<string, string>).date;

    // Need to format the date so it can be used in the link correctly.
    const formattedDate: string = new Date(date).toISOString();

    // Scrape all the data we need.
    const scrapeResults: ScrapeResult =
      await this.scraperEngine.scrape(formattedDate);

    this.logger.debug("Inserting Scraped Data...");

    // We can bundle the adding of tags, locations, prices and crops.
    await Promise.all([
      this.db.taxonomies.insertTags(scrapeResults.genres),
      this.db.taxonomies.insertPrices(scrapeResults.prices),
      this.db.taxonomies.insertLocations(scrapeResults.locations),
      this.db.media.insertCrops(scrapeResults.crops),
    ]);

    // Insert Items then galleries. We can then link the previous crops.
    await this.db.media.insertItems(scrapeResults.items);
    await this.db.media.insertGalleries(scrapeResults.galleries);

    // First Productions since we need those ids for Events.
    await this.db.production.insertProductions(scrapeResults.productions);
    await this.db.event.insertEvents(scrapeResults.events);

    // After scraping all data we can update the date in the DB.
    await this.dbConnection.query(
      `
        INSERT INTO scraper_dates (date) VALUES (NOW());
      `,
    );

    this.logger.debug("Insertion Finished!");
  }

  /**
   * Returns a list of crops where the images haven't been downloaded for.
   * @param amount The amount of crops to fetch.
   * @returns The list of crops with length amount or less together with total remaining.
   */
  async getPendingCrops(amount: number): Promise<PendingCrops> {
    return await this.db.media.getPendingCrops(amount);
  }

  /**
   * Updates a crop with a new archive url.
   * @param cropId The ID of the crop.
   * @param url The URL to update it with.
   * @returns The updated crop.
   */
  async updatePendingCrop(cropId: number, url: string): Promise<MediaCrop> {
    return await this.db.media.updateCropWithOwnUrl(cropId, url);
  }
}
