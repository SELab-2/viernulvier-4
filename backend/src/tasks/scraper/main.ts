import { scrapeMany } from "./scraper";
import { parseProductions, vnvProduction } from "./vnv.parser";

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
  console.dir(vnvProductions, { depth: null });

  return vnvProductions;
}

void scrape("2026-03-04T09:36:21+00:00");
