import "dotenv/config";
import { URLSearchParams } from "url";
import logger from "../logger/logger";
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

/**
 * The Base of the VNV API.
 */
const apiBase: string = "https://www.viernulvier.gent";

/**
 * A delay function we can use to wait a certain amount of time.
 * Useful when trying to avoid rate limits.
 * @param ms The amount of milliseconds we want to wait for.
 * @returns A Promise that does nothing for a set amount of time.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The important parts of an apiResponse.
 */
interface apiResponse {
  view: viewState;
  member: object[];
}

/**
 * The ViewState during a scrape, tells where the next page is.
 */
interface viewState {
  next: string | null;
}

/**
 * The results of a successful scrape.
 */
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
export async function scrape(
  after_date: string = "1970-01-01T00:00:00+00:00",
): Promise<ScrapeResult> {
  logger.info("Starting Scraper...");

  const [productions, events, event_prices, prices, genres, halls] =
    await Promise.all([
      scrapeMany("/api/v1/productions?page=1", after_date),
      scrapeMany("/api/v1/events?page=1", after_date),
      scrapeMany("/api/v1/events/prices?page=1", after_date),
      scrapeMany("/api/v1/prices?page=1", "1970-01-01T00:00:00+00:00"),
      scrapeMany("/api/v1/genres?page=1", after_date),
      scrapeMany("/api/v1/halls?page=1", after_date),
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

  logger.info("Finished Scraper!");

  return {
    productions: parseProductions(productions),
    events: parseEvents(events),
    prices: parsePrices(event_prices),
    genres: parseGenres(genres),
    locations: parseLocations(halls),
  };
}

/**
 * Helper function that will return an apiResponse object.
 * @param target The full URL to fetch.
 * @returns The apiResponse for that URL.
 */
async function fetchFromVnv(target: string): Promise<apiResponse> {
  const apiKey = process.env.CLIENT_API_KEY;
  if (!apiKey) throw new Error("Forgot to set CLIENT_API_KEY in .env?");

  const response = await fetch(target, {
    method: "GET",
    headers: {
      accept: "application/ld+json",
      "X-AUTH-TOKEN": `${apiKey}`,
    },
  });

  if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
  const jsonResponse: apiResponse = (await response.json()) as apiResponse;
  return jsonResponse;
}

/**
 * Scrapes data starting from the provided URL.
 * @param url The URL we want to start from, this is not including the base part of the url.
 * @param updatedAfter Optional Date that defines which data we want.
 * @returns A list of all the scraped objects. Generically typed.
 */
async function scrapeMany(
  url: string,
  updatedAfter: string,
): Promise<object[]> {
  const apiKey = process.env.CLIENT_API_KEY;
  if (!apiKey) {
    logger.error("Make sure to set CLIENT_API_KEY in .env!");
    return [];
  }

  const params = new URLSearchParams();
  params.append("updated_at[after]", updatedAfter);
  let view: viewState = {
    next: url + "&" + params.toString(),
  };
  const output: object[] = [];

  while (view.next) {
    try {
      const target: string = apiBase + view.next;

      const jsonResponse: apiResponse = await fetchFromVnv(target);
      view = jsonResponse.view;

      output.push(...jsonResponse.member);
      await delay(100);
    } catch (error) {
      logger.error("An error occurred: ", error);
      logger.error("Retrying...");
      await delay(5000); // Wait a bit longer before retrying.
    }
  }

  logger.info(`Scraped ${output.length} objects from ${url}.`);
  return output;
}

/**
 * Scrapes one single object from the URL.
 * @param url The URL we want to scrape from.
 * @returns The object that has been scraped.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function scrapeOne(url: string): Promise<object> {
  const apiKey = process.env.CLIENT_API_KEY;
  if (!apiKey) {
    logger.error("Make sure to set CLIENT_API_KEY in .env!");
    return [];
  }

  try {
    const target: string = apiBase + url;

    const jsonResponse: apiResponse = await fetchFromVnv(target);
    return jsonResponse;
  } catch (error) {
    logger.error("An error occurred: ", error);
    return {};
  }
}
