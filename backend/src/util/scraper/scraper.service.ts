import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MediaStorageService } from "../../media/media_storage/media_storage.service";
import { ScraperRunner } from "./scraper.runner";
import { CsvInjectionService } from "./csv/csv-injection.service";

/**
 * Service that handles the scraping of data and injecting of it into the database.
 */
@Injectable()
export class ScraperService implements OnApplicationBootstrap {
  constructor(
    private readonly logger: AppLogger,
    private readonly runner: ScraperRunner,
    private readonly csvInjectionService: CsvInjectionService,
    private readonly mediaStorage: MediaStorageService,
  ) {}

  /**
   * Checks whether the Scraper is currently enabled.
   */
  private get isScraperEnabled(): boolean {
    return process.env.ENABLE_SCRAPER === "true";
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

    // TODO: Re-enable the CSV injection.
    // this.logger.log("Running initial CSV injection...");
    // this.csvInjectionService
    //   .injectOldCsvData()
    //   .then(() => {
    //     this.logger.log(
    //       "Initial CSV injection finished successfully.",
    //       "ScraperService",
    //     );
    //   })
    //   .catch((err) => {
    //     this.logger.error(
    //       "Initial CSV injection failed",
    //       (err as Error).stack,
    //       "ScraperService",
    //     );
    //   });

    // this.logger.log("Running initial scrape...");
    // this.runner
    //   .runScraper()
    //   .then(() => {
    //     this.logger.log(
    //       "Initial scrape finished successfully.",
    //       "ScraperService",
    //     );
    //   })
    //   .catch((err: Error) => {
    //     this.logger.error(
    //       `Initial scrape failed ${err.message}`,
    //       err.stack,
    //       "ScraperService",
    //     );
    //   });
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

  /**
   * Image Scraping Job
   */

  private isProcessingMedia = false;
  private readonly downloadAmount = 50;

  @Cron(CronExpression.EVERY_MINUTE)
  async processImages() {
    if (this.isProcessingMedia) {
      this.logger.log("Still processing previous Crop Batch.");
      return;
    }

    // Start processing.
    this.isProcessingMedia = true;
    let processedCrops: number = 0;
    let totalLeft: number = 0;
    this.logger.log(
      `[PROCESSING] Attempting to process Batch of ${this.downloadAmount} Images...`,
    );

    try {
      // Find crops that still point to VNV
      const pendingCrops = await this.runner.getPendingCrops(
        this.downloadAmount,
      );
      processedCrops = pendingCrops.batch.length;
      totalLeft = pendingCrops.totalLeft;

      for (const crop of pendingCrops.batch) {
        try {
          const imageData = await this.getImageBuffer(crop.url);
        } catch (error) {
          this.logger.error(
            `Failed to process crop ${crop.id}: ${(error as Error).message}`,
          );
        }
      }
    } finally {
      this.isProcessingMedia = false;
    }

    this.logger.log(`
      [PROCESSING] Processed ${processedCrops}. ${totalLeft} left...
    `);
  }

  /**
   * Helper that will fetch an image from an URL an put it into
   * A Buffer object.
   * @param url The URL to the image.
   * @returns The Buffer.
   */
  private async getImageBuffer(url: string): Promise<Buffer> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    // Return the buffer for the image.
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
