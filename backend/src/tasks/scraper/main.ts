import { scrapeMany } from "./scraper";
import { parseProductions, vnvProduction } from "./vnv.parser";

export async function scrape() {
  // TODO: Add the date query to this.
  const productions: object[] = await scrapeMany(
    "/api/v1/productions?page=1",
    "2026-03-04T09:36:21+00:00",
  );

  const vnvProductions: vnvProduction[] = await parseProductions(productions);
  console.dir(vnvProductions, { depth: null });
}

void scrape();
