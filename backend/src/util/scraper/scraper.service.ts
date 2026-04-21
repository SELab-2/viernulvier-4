import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MediaStorageService } from "../../media/media_storage/media_storage.service";
import { ScraperRunner } from "./scraper.runner";
import { CsvInjectionService } from "./csv/csv-injection.service";
import path from "node:path";
import { ConfigService } from "@nestjs/config";
import * as https from "node:https";

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
  onApplicationBootstrap() {
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
  handleDailyScrape() {
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
   * Cron job that runs every day from 2-4 am. Will run the image fetching process.
   * stops if the 4 am limit is reached or all 50 fetches fail as a safeguard.
   * @returns Nothing.
   */
  @Cron("0 * 2 * * *")
  async processImages() {
    if (this.isProcessingMedia || !this.doDownloadMedia) return;

    this.isProcessingMedia = true;
    this.logger.log(
      `[WINDOW START] Starting nightly image processing window...`,
    );

    try {
      let hasMore = true;

      while (hasMore) {
        const currentHour = new Date().getHours();
        if (currentHour < 2 || currentHour >= 4) {
          // end the job.
          this.logger.log(`[WINDOW END] Time window closed. Stopping.`);
          break;
        }

        const { batch, totalLeft } = await this.runner.getPendingCrops(
          this.downloadAmount,
        );

        if (batch.length === 0) {
          // end the job.
          this.logger.log(`[FINISHED] No more images to process.`);
          hasMore = false;
          break;
        }

        this.logger.log(
          `[BATCH] Processing ${batch.length} images. ${totalLeft} remaining...`,
        );

        const results: PromiseSettledResult<number>[] = [];

        for (const crop of batch) {
          try {
            // download
            const imageData = await this.getImageBuffer(crop.url);
            const ext = path.extname(new URL(crop.url).pathname) || ".jpg";
            const newFileName = `${crop.id}-${crop.name}${ext}`;
            const finalUrl = `/photos/${newFileName}`;

            // save
            const savedUrl = await this.mediaStorage.saveMedia(
              finalUrl,
              imageData,
            );

            // update
            await this.runner.updatePendingCrop(crop.id, savedUrl);
            results.push({ status: "fulfilled", value: crop.id });
            await new Promise((resolve) => setTimeout(resolve, 250));
          } catch (error) {
            // error handling for image processing
            let errorMessage = "An unknown error occurred";
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === "string") {
              errorMessage = error;
            }
            results.push({ status: "rejected", reason: errorMessage });
          }
        }

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

        // stop the job if all fetches fail. (save log space)
        if (failCount === batch.length && batch.length > 0) {
          this.logger.error(
            `[CRITICAL ABORT] 100% failure rate detected (${failCount}/${batch.length} failed). Halting tonight's processing to prevent infinite error loops.`,
          );
          break;
        }

        if (totalLeft === 0) {
          hasMore = false;
        }
      }
    } catch (globalError) {
      // global error handling -> errors resulted besides image processing.
      this.logger.error(
        "Global Batch Failure:",
        (globalError as Error).message,
      );
    } finally {
      this.isProcessingMedia = false;
    }
  }

  /**
   * Helper that will fetch an image from a URL and put it into
   * A Buffer object.
   * @param url The URL to the image.
   * @returns The Buffer.
   */
  private getImageBuffer(url: string): Promise<Buffer> {
    const cleanUrl = url.replace(/["'\\]/g, "").trim();

    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
        // This forces the request to use IPv4, solving any DNS issues
        // without needing custom Agents or package.json flags!
        family: 4,
      };

      const req = https.get(cleanUrl, options, (res) => {
        // Handle HTTP errors (e.g., 404, 403, 500)
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          reject(
            new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`),
          );
          // Consume response data to free up memory
          res.resume();
          return;
        }

        const chunks: Buffer[] = [];

        res.on("data", (chunk) => {
          chunks.push(chunk as Buffer<ArrayBufferLike>);
        });

        res.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
      });

      // Handle pure network errors (e.g., ECONNRESET, ENOTFOUND)
      req.on("error", (err) => {
        reject(new Error(`Network Error: ${err.message}`));
      });

      // Set a 15-second timeout so it doesn't hang forever
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error("Network Error: Request timed out"));
      });
    });
  }
}
