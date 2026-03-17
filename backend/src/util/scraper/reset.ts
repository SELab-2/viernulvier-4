import { UtilsDbConnection } from "./database/db.connection";
import logger from "../logger/logger";

// Make sure to execute from the root.
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

/**
 * Will remove all data from the database but the leave the tables.
 */
async function resetDatabase() {
  logger.warn("Nuking Database...");
  const dbConnection: UtilsDbConnection = new UtilsDbConnection();

  // Reset all database tables that need resetting.
  await dbConnection.query(
    `
    TRUNCATE TABLE
      production_blogs, production_tag, event_prices, event_locations, locations, tags, events, blogs, productions, prices, scraper_dates
    RESTART IDENTITY CASCADE;
  `,
    [],
  );

  // Insert the base LINUX date so we scrape the whole VNV API again.
  await dbConnection.query(
    `
    INSERT INTO scraper_dates DEFAULT VALUES;
    `,
  );

  logger.warn("Successfully nuked the database!");
}

/**
 * This script will reset the tables and id assignment in the database.
 */
void resetDatabase();
