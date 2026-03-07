import { Production } from "@repo/common";
import { scrapeMany } from "./scraper";
import { parseProductions, vnvProduction } from "./vnv.parser";
import { DbConnection } from "./db.connection";

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

async function insertProduction(
  connection: DbConnection,
  production: vnvProduction,
): Promise<boolean> {
  const result: Production[] = await connection.query<Production>(
    `
      SELECT * from productions WHERE legacy_id = $1
    `,
    [production.legacy_id],
  );

  // If we have found a matching production we can insert safely.
  let query: string;
  let values;
  if (result.length > 0) {
    query = `
      UPDATE productions
      SET 
        titel = $1,
        description1 = $2,
        description2 = $3,
        artist = $4,
        tagline = $5,
        credits = $6,
        performer_mode = $7,
        attendance_type = $8
      WHERE legacy_id = $9
      RETURNING *;
    `;
    values = [
      production.title,
      production.description,
      production.description_2,
      production.artist,
      production.tagline,
      production.info,
      production.performer_type,
      production.attendance_mode,
      production.legacy_id,
    ];
  } else {
    query = `INSERT INTO productions (
      titel,
      description1,
      description2,
      artist,
      tagline,
      credits,
      legacy_id,
      performer_mode,
      attendance_type
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
    `;
    values = [
      production.title,
      production.description,
      production.description_2,
      production.artist,
      production.tagline,
      production.info,
      production.legacy_id,
      production.performer_type,
      production.attendance_mode,
    ];
  }

  const output: Production[] = await connection.query<Production>(
    query,
    values,
  );

  console.log(`Inserted legacy_id: ${production.legacy_id}`);
  return output.length > 0;
}

/**
 * Main entrypoint of the worker.
 */
async function main() {
  const dbConnection: DbConnection = new DbConnection();

  const productions: vnvProduction[] = await scrape(
    "2026-03-04T09:36:21+00:00",
  );

  const valid: boolean = await insertProduction(dbConnection, productions[0]);
  if (!valid) throw new Error("Failed to insert Production.");
}

void main();
