import { Pool, QueryResultRow } from "pg";
import logger from "../../logger/logger";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Holds the Connection to the database and important inserting functions.
 *
 * We defined this separate from the main connection that the backend uses to
 * communicate with the database for two main reasons.
 *  1: The Queries in here are highly specific to this use case and also allows
 *     insert of multiple languages at once (which the backend connection doesn't).
 *  2: If this connection to the database crashes for some reason, the one
 *     used in the backend isn't affected.
 *
 * In short: We chose to split the DB connections for backend and scraper to make
 *           sure there can be no confusions between the two and so they can't
 *           hinder each other either.
 */

@Injectable()
export class ScraperDbService implements OnModuleDestroy {
  /**
   * The Pool to the database, used to execute queries.
   */
  private pool: Pool;
  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      user: this.configService.get<string>("DB_USER_DEV"),
      host: this.configService.get<string>("DB_HOST_DEV"),
      database: this.configService.get<string>("DB_NAME_DEV"),
      password: this.configService.get<string>("DB_PASSWORD_DEV"),
      port: Number(this.configService.get<string>("DB_PORT_DEV")),
    });
  }

  /**
   * Automatically destroy the database connection on stop.
   */
  async onModuleDestroy() {
    await this.pool.end();
  }

  /**
   * This function sends a query to the database.
   * @param query This is the to be executed query
   * @param params These are the possible parameters used in the query annotated by "$1",... as is convention in SQL.
   * @return a generic type that is a scheme of the database.
   * */
  async query<T extends QueryResultRow = any>(
    query: string,
    params?: any[],
  ): Promise<T[]> {
    try {
      const res = await this.pool.query<T>(query, params); // keep await here.
      return res.rows;
    } catch (error) {
      logger.error(
        `Database Query Failed: ${query}\nParams: ${JSON.stringify(params)}`,
        error,
      );
      throw error; // Let the caller know it failed!
    }
  }

  async processInBatches<T, U>(
    label: string,
    items: T[],
    batchSize: number,
    processor: (item: T) => Promise<U>,
  ): Promise<void> {
    const total = items.length;
    if (total === 0) return;

    const startTime = Date.now();
    let completed = 0;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = items.slice(i, i + batchSize);

      // 1. Get a dedicated client from the pool
      const client = await this.pool.connect();

      try {
        await client.query("BEGIN");

        for (const item of chunk) {
          await processor(item);
          completed++;
        }

        await client.query("COMMIT");

        // Progress Log
        const percent = Math.floor((completed / total) * 100);
        const eta = this.calculateETA(startTime, completed, total);
        logger.info(
          `[BATCH DB] ${label}: ${percent}% (${completed}/${total}) | ETA: ${eta}`,
        );
      } catch (error) {
        await client.query("ROLLBACK");
        logger.error(
          `[BATCH ERROR] Failed at index ${i}. Batch rolled back.`,
          error,
        );
        throw error; // Stop the whole scraper if the DB is failing
      } finally {
        client.release();
      }
    }
  }

  /**
   * Calculates the ETA of a network action.
   * @param startTime The starting time of the action.
   * @param current The current items.
   * @param total The total items.
   * @returns A time string.
   */
  calculateETA(startTime: number, current: number, total: number): string {
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
