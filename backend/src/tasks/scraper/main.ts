import { scrapeMany } from "./scraper";
import { parseProductions, vnvProduction } from "./vnv.parser";
import { DbConnection } from "./db.connection";

/**
 * Scrapes the existing data we need from the VNV API.
 * @param after_date The Date&Time we want to be fetching things after.
 */
async function scrape(
  after_date: string = "1970-01-01T00:00:00+00:00",
): Promise<vnvProduction[]> {
  const productions: object[] = await scrapeMany(
    "/api/v1/productions?page=1",
    after_date,
  );

  const vnvProductions: vnvProduction[] = await parseProductions(productions);
  return vnvProductions;
}

/**
 * Main entrypoint of the worker.
 */
async function main() {
  const dbConnection: DbConnection = new DbConnection();

  // Scrape all the data we need.
  const productions: vnvProduction[] = await scrape(
    "2026-03-04T09:36:21+00:00",
  );

  // Firstly we will insert all the new productions.
  for (const production of productions) {
    const valid: boolean = await dbConnection.insert(production);
    if (!valid)
      console.error(
        `Failed to insert Production with legacy_id=${production.legacy_id}.`,
      );
  }
}

void main();
