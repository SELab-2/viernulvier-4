import { scrape, ScrapeResult } from "./scraper";
import { DbConnection } from "./db.connection";
import logger from "../logger/logger";

/**
 * Main entrypoint of the worker.
 */
export async function runScraper() {
  const dbConnection: DbConnection = new DbConnection();

  // Fetch the last scraped date.
  const dates = await dbConnection.query(
    `
      SELECT date FROM scraper_dates ORDER BY date DESC LIMIT 1;
    `,
  );
  const date: string = (dates[0] as Record<string, string>).date;

  // Need to format the date so it can be used in the link correctly.
  const formattedDate: string = new Date(date).toISOString();

  // Scrape all the data we need.
  const scrapeResults: ScrapeResult = await scrape(formattedDate);

  logger.info("Inserting Scraped Data...");

  // We can bundle the adding of tags, locations and prices.
  // We need to insert these BEFORE the Productions and Events
  // because we need them to already be in the database when linking them up.
  await Promise.all([
    dbConnection.insertTags(scrapeResults.genres),
    dbConnection.insertPrices(scrapeResults.prices),
    dbConnection.insertLocations(scrapeResults.locations),
  ]);

  // First Productions since we need those ids for Events.
  await dbConnection.insertProductions(scrapeResults.productions);
  await dbConnection.insertEvents(scrapeResults.events);

  // After scraping all data we can update the date in the DB.
  await dbConnection.query(
    `
      INSERT INTO scraper_dates (date) VALUES (NOW());
    `,
  );

  logger.info("Insertion Finished!");
}
