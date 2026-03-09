import { scrape, ScrapeResult } from "./scraper";
import { DbConnection } from "./db.connection";
import logger from "../logger/logger";

/**
 * Main entrypoint of the worker.
 */
async function main() {
  const dbConnection: DbConnection = new DbConnection();

  // TODO: Get the last_scrape_date from the DB.

  // Scrape all the data we need.
  const scrapeResults: ScrapeResult = await scrape("2026-03-04T09:36:21+00:00");

  logger.info("Inserting Scraped Data...");

  // We can bundle the adding of tags, locations and prices.
  await Promise.all([
    dbConnection.insertTags(scrapeResults.genres),
    dbConnection.insertPrices(scrapeResults.prices),
    dbConnection.insertLocations(scrapeResults.locations),
  ]);

  // First Productions since we need those ids for Events.
  await dbConnection.insertProductions(scrapeResults.productions);
  await dbConnection.insertEvents(scrapeResults.events);

  logger.info("Insertion Finished!");
}

void main();
