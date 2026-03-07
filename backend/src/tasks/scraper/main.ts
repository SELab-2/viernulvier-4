import { Production } from "@repo/common";
import { scrapeMany } from "./scraper";
import { parseProductions, vnvProduction } from "./vnv.parser";
import { Pool, QueryResultRow } from "pg";

/**
 * Scrapes the existing data we need from the VNV API.
 * @param after_date The Date&Time we want to be fetching things after.
 */
async function scrape(
  after_date: string = "1970-01-01T00:00:00+00:00",
): Promise<vnvProduction[]> {
  const productions: object[] = await scrapeMany(
    "/api/v1/productions?page=1",
    after_date,
  );

  const vnvProductions: vnvProduction[] = await parseProductions(productions);
  console.dir(vnvProductions, { depth: null });

  return vnvProductions;
}

/**
 * Execute a query to the database using a pool.
 * @param pool The pool/connection to the database.
 * @param query The query that should be used.
 * @param params The parameters of the query.
 * @returns The result of the query.
 */
async function query<T extends QueryResultRow = any>(
  pool: Pool,
  query: string,
  params?: any[],
): Promise<T[]> {
  const res = await pool.query<T>(query, params); // keep await.
  return res.rows;
}

/**
 * Main entrypoint of the worker.
 */
async function main() {
  const pool: Pool = new Pool({
    user: process.env.DB_USER_DEV,
    host: process.env.DB_HOST_DEV,
    database: process.env.DB_NAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    port: Number(process.env.DB_PORT_DEV),
  });

  const productions: Production[] = await query<Production>(
    pool,
    "SELECT * FROM productions",
    [],
  );

  console.log(productions);
  await scrape("2026-03-04T09:36:21+00:00");
}

void main();
