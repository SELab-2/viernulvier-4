import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MediaStorageService } from "../../media/media_storage/service/media_storage.service";
import { ScraperRunner } from "./scraper.runner";
import { CsvInjectionService } from "./csv/csv-injection.service";
import path from "node:path";
import { ConfigService } from "@nestjs/config";
import { Agent } from "undici";
import * as dns from "node:dns";

// Create a dispatcher that strictly uses IPv4
const ipv4Agent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      // Force family: 4 (IPv4)
      dns.lookup(hostname, { family: 4 }, callback);
    },
  },
});

/**
 * Service that handles the scraping of data and injecting of it into the database.
 */
@Injectable()
export class ScraperService implements OnApplicationBootstrap {
  /**
   * Image Scraping Job
   */

  private isProcessingMedia = false;
  private readonly downloadAmount = 50;

  constructor(
    private readonly logger: AppLogger,
    private readonly runner: ScraperRunner,
    private readonly csvInjectionService: CsvInjectionService,
    private readonly mediaStorage: MediaStorageService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Checks whether the Scraper is currently enabled.
   */
  private get isScraperEnabled(): boolean {
    return this.configService.get<string>("ENABLE_SCRAPER", "false") === "true";
  }

  /**
   * Checks whether the Scraper should download unprocessed media.
   */
  private get doDownloadMedia(): boolean {
    return this.configService.get<string>("DOWNLOAD_MEDIA", "false") === "true";
  }

  /**
   * Ran when the app first starts, runs an initial scrape.
   * @returns Nothing.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async onApplicationBootstrap() {
    if (!this.isScraperEnabled) {
      this.logger.log("Skipping initial scrape (Scraping is DISABLED).");
      return;
    }

    this.logger.log("Running initial CSV injection...");
    this.csvInjectionService
      .injectOldCsvData()
      .then(() => {
        this.logger.log(
          "Initial CSV injection finished successfully.",
          "ScraperService",
        );
      })
      .catch((err) => {
        this.logger.error(
          "Initial CSV injection failed",
          (err as Error).stack,
          "ScraperService",
        );
      });

    this.logger.log("Running initial scrape...");
    this.runner
      .runScraper()
      .then(() => {
        this.logger.log(
          "Initial scrape finished successfully.",
          "ScraperService",
        );
      })
      .catch((err: Error) => {
        this.logger.error(
          `Initial scrape failed ${err.message}`,
          err.stack,
          "ScraperService",
        );
      });
  }

  /**
   * Cron job that runs every day at midnight. Will run the scraper.
   * @returns Nothing.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // eslint-disable-next-line @typescript-eslint/require-await
  async handleDailyScrape() {
    if (!this.isScraperEnabled) {
      this.logger.log("Skipping scheduled scrape (Scraping is DISABLED).");
      return;
    }

    this.logger.log("Running scheduled daily scrape...");
    this.runner
      .runScraper()
      .then(() => {
        this.logger.log(
          "Scheduled scrape finished successfully.",
          "ScraperService",
        );
      })
      .catch((err) => {
        this.logger.error(
          "Scheduled scrape failed",
          (err as Error).stack,
          "ScraperService",
        );
      });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processImages() {
    if (this.isProcessingMedia || !this.doDownloadMedia) return;

    // Start processing.
    this.isProcessingMedia = true;
    this.logger.log(
      `[PROCESSING] Attempting to process Batch of ${this.downloadAmount} Images...`,
    );

    try {
      const { batch, totalLeft } = await this.runner.getPendingCrops(
        this.downloadAmount,
      );
      if (batch.length === 0) return;
      const mediaBase = this.configService.get<string>("MEDIA_BASE_URL");
      if (!mediaBase)
        throw Error("Forgot to set MEDIA_BASE_URL .env variable?");

      // Process all 50 images in parallel
      const results = await Promise.allSettled(
        batch.map(async (crop) => {
          const imageData = await this.getImageBuffer(crop.url);

          // Filename logic.
          // We name the file based on the crop's ID and NAME.
          // NOTE: No hashing because it would cause strays.
          const ext = path.extname(new URL(crop.url).pathname) || ".jpg";
          const newFileName = `${crop.id}-${crop.name}${ext}`;
          const finalUrl = `/photos/${newFileName}`;

          // Save & Update
          const savedUrl = await this.mediaStorage.saveMedia(
            finalUrl,
            imageData,
          );
          await this.runner.updatePendingCrop(crop.id, savedUrl);

          return crop.id;
        }),
      );

      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failCount = results.length - successCount;
      const failedItems = results.filter((r) => r.status === "rejected");
      if (failCount > 0) {
        failedItems.forEach((failure, index) => {
          const failedCrop = batch[index];

          this.logger.error(
            `[IMAGE FAILURE]: Crop ${failedCrop.id} failed. ` +
              `URL: "${failedCrop.url}" | Reason: ${failure.reason}`,
          );
        });
      }

      this.logger.log(
        `[BATCH FINISHED] Success: ${successCount}, Failed: ${failCount}. Approx ${totalLeft} left.`,
      );
    } catch (globalError) {
      this.logger.error(
        "Global Batch Failure:",
        (globalError as Error).message,
      );
    } finally {
      this.isProcessingMedia = false;
    }
  }

  /**
   * Helper that will fetch an image from an URL an put it into
   * A Buffer object.
   * @param url The URL to the image.
   * @returns The Buffer.
   */
  private async getImageBuffer(url: string): Promise<Buffer> {
    const response = await fetch(url, {
      // @ts-ignore - dispatcher is a Node-specific extension to standard fetch
      dispatcher: ipv4Agent,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    // Return the buffer for the image.
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
