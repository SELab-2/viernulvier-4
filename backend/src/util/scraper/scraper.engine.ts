import { URLSearchParams } from "url";
import {
  parseEvents,
  parseGalleries,
  parseGenres,
  parseLocations,
  parseMediaCrops,
  parseMediaItems,
  parsePrices,
  parseProductions,
  vnvEvent,
  vnvGallery,
  vnvGenre,
  vnvLocation,
  vnvMediaCrop,
  vnvMediaItem,
  vnvPrice,
  vnvProduction,
} from "./vnv.parser";
import { LanguageService } from "../language/language.service";
import { Injectable } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import Bottleneck from "bottleneck";
import {
  CROP_NAMES,
  CropName,
} from "@repo/common/src/objects/media/media_crop";
import { ConfigService } from "@nestjs/config";

const apiDomain: string = "/api/v1/";

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
  crops: vnvMediaCrop[];
}

/**
 * The scraper engine class.
 * The core logic of the scraper.
 * note: this class handles all logic for the scraping part, db insertion happens in the scraper runner.
 */
@Injectable()
export class ScraperEngine {
  /**
   * The Base of the VNV API.
   */
  private readonly apiBase: string;
  /**
   * Limiter used for scraping.
   */
  private readonly limiter = new Bottleneck({
    maxConcurrent: 20, // Maximum connections open at a time.
    minTime: 50, // Waits x ms between starts.
  });

  constructor(
    private readonly languageService: LanguageService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
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

    this.apiBase = this.configService.get<string>(
      "MEDIA_API_URL",
      "https://www.viernulvier.gent",
    );
  }

  /**
   * Scrapes the existing data we need from the VNV API.
   * @param after_date The Date&Time we want to be fetching things after.
   */
  async scrape(after_date: string): Promise<ScrapeResult> {
    this.logger.debug("Starting Scraper...");

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
      this.scrapeMany("productions", after_date),
      this.scrapeMany("events", after_date),
      this.scrapeMany("events/prices", after_date),
      this.scrapeMany("prices", "1970-01-01T00:00:00.000Z"),
      this.scrapeMany("genres", after_date),
      this.scrapeMany("halls", after_date),
      this.scrapeMany("media/galleries", after_date),
      this.scrapeMany("media/items", after_date),
      this.scrapeMany("media/items/crops", after_date),
    ]);

    // Fix the items and sift out crops that we don't need.
    const fixedItems = await this.fixItems(items);
    const siftedCrops = this.siftCrops(crops);

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
      crops: parseMediaCrops(siftedCrops),
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
    const apiKey = this.configService.get<string>("CLIENT_API_KEY");
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
      next: apiDomain + url + "?page=1&" + params.toString(),
    };
    const output: object[] = [];

    // Progress tracking
    let totalItems: number = 0;
    let processedItems: number = 0;
    let lastLoggedPercent: number = -1;
    const startTime: number = Date.now();

    while (view.next) {
      try {
        const jsonResponse = await this.fetchFromVnv(this.apiBase + view.next);

        if (totalItems === 0) {
          totalItems =
            ((jsonResponse as Record<string, any>)["totalItems"] as number) ||
            0;
          this.logger.log(
            `Starting scrape of ${url}. Total items to fetch: ${totalItems}.`,
          );
        }

        view = jsonResponse.view;
        output.push(...jsonResponse.member);
        processedItems += jsonResponse.member.length;

        const percent = Math.floor((processedItems / totalItems) * 100);

        if (percent !== lastLoggedPercent) {
          const eta = this.calculateETA(startTime, processedItems, totalItems);

          this.logger.log(
            `[PROGRESS] ${url}: ${percent}% (${processedItems}/${totalItems}) | ETA: ${eta}`,
          );

          lastLoggedPercent = percent;
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch page: ${view.next}`,
          (error as Error).stack,
        );
        break; // Triggered when all retries fail.
      }
    }

    return output;
  }

  /**
   * Scrapes one single object from the URL.
   * @param url The URL we want to scrape from.
   * @returns The object that has been scraped.
   */
  async scrapeOne(url: string): Promise<object> {
    try {
      return await this.fetchFromVnv(this.apiBase + url);
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
    const total: number = items.length;
    let completed: number = 0;
    let lastLoggedPercent: number = -1;
    const startTime: number = Date.now();

    const fetchPromises = items.map(async (item) => {
      const fullItem = await this.scrapeOne(item["@id"] as string);

      completed++;
      const percent = Math.floor((completed / total) * 100);

      if (percent !== lastLoggedPercent) {
        const eta = this.calculateETA(startTime, completed, total);
        this.logger.log(
          `[PROGRESS] Fixing items: ${percent}% (${completed}/${total}) | ETA: ${eta}`,
        );
        lastLoggedPercent = percent;
      }

      return fullItem;
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
    this.logger.log("Sifting crops...");
    const filteredCrops = crops.filter((crop) =>
      CROP_NAMES.includes(crop.name as CropName),
    );
    this.logger.log("Sifted crops!");
    return filteredCrops;
  }

  /**
   * Calculates the ETA of a network action.
   * @param startTime The starting time of the action.
   * @param current The current items.
   * @param total The total items.
   * @returns A time string.
   */
  private calculateETA(
    startTime: number,
    current: number,
    total: number,
  ): string {
    if (current === 0) return "Calculating...";

    const elapsed = Date.now() - startTime; // ms spent so far
    const msPerItem = elapsed / current;
    const remainingItems = total - current;
    const remainingMs = remainingItems * msPerItem;

    // Convert MS to a nice string like "2m 30s"
    const seconds = Math.floor((remainingMs / 1000) % 60);
    const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }
}
