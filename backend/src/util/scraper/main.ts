import { ScraperEngine, ScrapeResult } from "./scraper";
import { Injectable } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import { UtilsDbConnection } from "./database/db.connection";

@Injectable()
export class ScraperRunner {
  constructor(
    private readonly scraperEngine: ScraperEngine,
    private readonly logger: AppLogger,
    private readonly dbConnection: UtilsDbConnection,
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

    // TODO: Remove debug prints.
    console.log(scrapeResults.items);

    this.logger.debug("Inserting Scraped Data...");

    // We can bundle the adding of tags, locations and prices.
    // We need to insert these BEFORE the Productions and Events
    // because we need them to already be in the database when linking them up.
    await Promise.all([
      this.dbConnection.insertTags(scrapeResults.genres),
      this.dbConnection.insertPrices(scrapeResults.prices),
      this.dbConnection.insertLocations(scrapeResults.locations),
    ]);

    // First Productions since we need those ids for Events.
    await this.dbConnection.insertProductions(scrapeResults.productions);
    await this.dbConnection.insertEvents(scrapeResults.events);

    // After scraping all data we can update the date in the DB.
    await this.dbConnection.query(
      `
        INSERT INTO scraper_dates (date) VALUES (NOW());
      `,
    );

    this.logger.debug("Insertion Finished!");
  }
}
