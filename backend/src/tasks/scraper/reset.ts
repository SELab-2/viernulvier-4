import { DbConnection } from "./db.connection";

async function resetDatabase() {
  console.log("Nuking Database.");
  const dbConnection: DbConnection = new DbConnection();

  await dbConnection.query(
    `
    TRUNCATE TABLE 
      production_blogs, production_tag, event_prices, event_locations, locations, tags, events, blogs, productions, prices
    RESTART IDENTITY CASCADE
  `,
    [],
  );

  console.log("Successfully nuked the database.");
}

/**
 * This script will reset the tables and id assignment in the database.
 */
void resetDatabase();
