import { scrapeMany } from "./scraper";
import {
  parseEvents,
  parseGenres,
  parseLocations,
  parsePrices,
  parseProductions,
  vnvEvent,
  vnvGenre,
  vnvLocation,
  vnvPrice,
  vnvProduction,
} from "./vnv.parser";
import { DbConnection } from "./db.connection";

export interface ScrapeResult {
  productions: vnvProduction[];
  events: vnvEvent[];
  prices: vnvPrice[];
  genres: vnvGenre[];
  locations: vnvLocation[];
}

/**
 * Scrapes the existing data we need from the VNV API.
 * @param after_date The Date&Time we want to be fetching things after.
 */
async function scrape(
  after_date: string = "1970-01-01T00:00:00+00:00",
): Promise<ScrapeResult> {
  const [productions, events, event_prices, prices, genres, halls] =
    await Promise.all([
      scrapeMany("/api/v1/productions?page=1", after_date),
      scrapeMany("/api/v1/events?page=1", after_date),
      scrapeMany("/api/v1/events/prices?page=1", after_date),
      scrapeMany("/api/v1/prices?page=1", "1970-01-01T00:00:00+00:00"),
      scrapeMany("/api/v1/genres?page=1", after_date),
      scrapeMany("/api/v1/locations?page=1", after_date), // <-- Fixed your copy-paste bug here!
    ]);

  const priceDictionary = new Map<string, object>();
  for (const price of prices) {
    const id = (price as Record<string, any>)["@id"] as string;
    priceDictionary.set(id, price);
  }
  for (const event_price of event_prices) {
    (event_price as Record<string, any>).price = priceDictionary.get(
      (event_price as Record<string, any>).price as string,
    );
  }

  return {
    productions: parseProductions(productions),
    events: parseEvents(events),
    prices: parsePrices(event_prices),
    genres: parseGenres(genres),
    locations: parseLocations(halls),
  };
}

/**
 * Main entrypoint of the worker.
 */
async function main() {
  const dbConnection: DbConnection = new DbConnection();

  // Scrape all the data we need.
  const scrapeResults: ScrapeResult = await scrape("2026-03-04T09:36:21+00:00");

  console.log(scrapeResults);
}

void main();
