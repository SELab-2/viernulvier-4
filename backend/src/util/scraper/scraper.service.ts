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

  /**
   * Image Scraping Job
   */

  private isProcessingMedia = false;
  private readonly downloadAmount = 50;

  @Cron(CronExpression.EVERY_MINUTE)
  async processImages() {
    if (this.isProcessingMedia) return;
    this.isProcessingMedia = true;
    this.logger.log("Processing Batch of Images...");

    try {
      // Find crops that still point to VNV
      const pendingCrops = await this.runner.getPendingCrops(
        this.downloadAmount,
      );
      console.log(pendingCrops);
    } finally {
      this.isProcessingMedia = false;
    }
  }
}
