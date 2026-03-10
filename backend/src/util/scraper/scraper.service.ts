import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { runScraper } from "./main";
import { AppLogger } from "../logger/logger.service";
import { Cron, CronExpression } from "@nestjs/schedule";

/**
 * Service that handles the scraping of data and injecting of it into the database.
 */
@Injectable()
export class ScraperService implements OnApplicationBootstrap {
  constructor(private readonly logger: AppLogger) {}

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

    this.logger.log("Running initial scrape...");
    runScraper()
      .then(() => {
        this.logger.log(
          "Initial scrape finished successfully.",
          "ScraperService",
        );
      })
      .catch((err) => {
        this.logger.error(
          "Initial scrape failed",
          (err as Error).stack,
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
    runScraper()
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
}
