import { DbConnection } from "./db.connection";
import logger from "../logger/logger";

/**
 * Will remove all data from the database but the leave the tables.
 * TODO: Also reset the latest scrape date field.
 */
async function resetDatabase() {
  logger.warn("Nuking Database...");
  const dbConnection: DbConnection = new DbConnection();

  await dbConnection.query(
    `
    TRUNCATE TABLE 
      production_blogs, production_tag, event_prices, event_locations, locations, tags, events, blogs, productions, prices
    RESTART IDENTITY CASCADE
  `,
    [],
  );

  logger.warn("Successfully nuked the database!");
}

/**
 * This script will reset the tables and id assignment in the database.
 */
void resetDatabase();
