import "dotenv/config";
import { URLSearchParams } from "url";
import {
  parseEvents,
  parseGalleries,
  parseGenres,
  parseLocations,
  parseMediaItems,
  parsePrices,
  parseProductions,
  vnvEvent,
  vnvGallery,
  vnvGenre,
  vnvLocation,
  vnvMediaItem,
  vnvPrice,
  vnvProduction,
} from "./vnv.parser";
import { LanguageService } from "../language/language.service";
import { Injectable } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import Bottleneck from "bottleneck";
import { CROP_NAMES, CropName } from "@repo/common/src/objects/media";

/**
 * The Base of the VNV API.
 */
const apiBase: string = "https://www.viernulvier.gent";

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
  galleries: vnvGallery[];
  items: vnvMediaItem[];
}

@Injectable()
export class ScraperEngine {
  constructor(
    private readonly languageService: LanguageService,
    private readonly logger: AppLogger,
  ) {
    // eslint-disable-next-line @typescript-eslint/require-await
    this.limiter.on("failed", async (error: Error, jobInfo) => {
      if (jobInfo.retryCount < 3) {
        // Retry up to 3 times.
        this.logger.warn(
          `Retrying job ${jobInfo.options.id}: ${error.message}`,
        );
        return 2500; // Wait 2.5s before retrying.
      } else {
        this.logger.warn(`Abandoning job ${jobInfo.options.id}`);
      }
    });
  }

  /**
   * Limiter used for scraping.
   */
  private readonly limiter = new Bottleneck({
    maxConcurrent: 20, // Maximum connections open at a time.
    minTime: 50, // Waits x ms between starts.
  });

  /**
   * Scrapes the existing data we need from the VNV API.
   * @param after_date The Date&Time we want to be fetching things after.
   */
  async scrape(after_date: string): Promise<ScrapeResult> {
    this.logger.debug("Starting Scraper...");

    // TODO: Remove dummy date when actual scraping begins.
    const dummyDate: string = "2026-03-20T00:00:00.000Z";

    const [
      productions,
      events,
      event_prices,
      prices,
      genres,
      halls,
      galleries,
      items,
      crops,
    ] = await Promise.all([
      this.scrapeMany("/api/v1/productions?page=1", after_date),
      this.scrapeMany("/api/v1/events?page=1", after_date),
      this.scrapeMany("/api/v1/events/prices?page=1", after_date),
      this.scrapeMany("/api/v1/prices?page=1", "1970-01-01T00:00:00.000Z"),
      this.scrapeMany("/api/v1/genres?page=1", after_date),
      this.scrapeMany("/api/v1/halls?page=1", after_date),
      this.scrapeMany("/api/v1/media/galleries?page=1", dummyDate),
      this.scrapeMany("/api/v1/media/items?page=1", dummyDate),
      this.scrapeMany("/api/v1/media/items/crops?page=1", dummyDate),
    ]);

    // TODO: Remove Debug prints
    console.log(crops);

    this.logger.log("Fixing items...");
    const fixedItems = await this.fixItems(items);
    this.logger.log("Fixed items!");

    this.logger.log("Sifting crops...");
    const siftedCrops = this.siftCrops(crops);
    this.logger.log("Sifted crops!");

    // TODO: Remove Debug prints
    console.log(siftedCrops);

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

    this.logger.debug("Finished Scraper!");

    const results: ScrapeResult = {
      productions: parseProductions(productions),
      events: parseEvents(events),
      prices: parsePrices(event_prices),
      genres: parseGenres(genres),
      locations: parseLocations(halls),
      galleries: parseGalleries(galleries),
      items: parseMediaItems(fixedItems),
    };

    this.logger.debug("Started translating");

    // add translations here if you want to translate to more languages.
    const translated_results =
      await this.languageService.translateObject<ScrapeResult>(
        results,
        "nl",
        "en",
      );

    this.logger.debug("Finished translating");

    return translated_results;
  }

  /**
   * Helper function that will return an apiResponse object.
   * @param target The full URL to fetch.
   * @returns The apiResponse for that URL.
   */
  async fetchFromVnv(target: string): Promise<apiResponse> {
    const apiKey = process.env.CLIENT_API_KEY;
    if (!apiKey) throw new Error("Forgot to set CLIENT_API_KEY in .env?");

    return this.limiter.schedule({ id: target }, async () => {
      const response = await fetch(target, {
        method: "GET",
        headers: {
          accept: "application/ld+json",
          "X-AUTH-TOKEN": `${apiKey}`,
        },
      });

      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      return (await response.json()) as apiResponse;
    });
  }

  /**
   * Scrapes data starting from the provided URL.
   * @param url The URL we want to start from, this is not including the base part of the url.
   * @param updatedAfter Optional Date that defines which data we want.
   * @returns A list of all the scraped objects. Generically typed.
   */
  async scrapeMany(url: string, updatedAfter: string): Promise<object[]> {
    const params = new URLSearchParams();
    params.append("updated_at[after]", updatedAfter);

    let view: viewState = {
      next: url + "&" + params.toString(),
    };
    const output: object[] = [];

    while (view.next) {
      try {
        const jsonResponse = await this.fetchFromVnv(apiBase + view.next);
        view = jsonResponse.view;
        output.push(...jsonResponse.member);
      } catch (error) {
        this.logger.error(
          `Failed to fetch page: ${view.next}`,
          (error as Error).stack,
        );
        break; // Triggered when all retries fail.
      }
    }

    this.logger.debug(`Scraped ${output.length} objects from ${url}.`);
    return output;
  }

  /**
   * Scrapes one single object from the URL.
   * @param url The URL we want to scrape from.
   * @returns The object that has been scraped.
   */
  async scrapeOne(url: string): Promise<object> {
    try {
      return await this.fetchFromVnv(apiBase + url);
    } catch {
      this.logger.error(`Failed scrapeOne for ${url}`);
      return {}; // Triggered when all retries fail.
    }
  }

  /**
   * This function is needed because of the "crops" field missing in the paginated
   * response from the VNV API for media items.
   * This means we have to individually fetch each item again after fetching
   * the whole list. That's what this function does.
   * @param items The currently fetched items, to be extended with crops.
   * @returns The fixed raw item objects.
   */
  private async fixItems(
    items: Record<string, any>[],
  ): Promise<Record<string, any>[]> {
    const fetchPromises = items.map(async (item) => {
      return await this.scrapeOne(item["@id"] as string);
    });

    return await Promise.all(fetchPromises);
  }

  /**
   * Filters out all crops that we don't need and only leaves the
   * ones we'll use in the archive.
   * @param crops The complete list of crops.
   * @returns The list of crops that we need.
   */
  private siftCrops(crops: Record<string, any>[]): Record<string, any>[] {
    return crops.filter((crop) => CROP_NAMES.includes(crop.name as CropName));
  }
}
