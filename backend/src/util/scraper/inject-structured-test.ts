import * as dotenv from "dotenv";
import * as path from "path";
import logger from "../logger/logger";
import {
  injectBlogsCSV,
  injectEventsCSV,
  injectPricesCSV,
  injectProductionsCSV,
  injectTagsCSV,
} from "./inject-csv";

// Load DEV database env vars for script usage from root .env
dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

type StructuredCsvPaths = {
  productions: string;
  events: string;
  tags: string;
  blogs: string;
  prices: string;
};

function buildStructuredCsvPaths(baseDir: string): StructuredCsvPaths {
  return {
    productions: path.join(baseDir, "productions_test.csv"),
    events: path.join(baseDir, "events_test.csv"),
    tags: path.join(baseDir, "tags_test.csv"),
    blogs: path.join(baseDir, "blogs_test.csv"),
    prices: path.join(baseDir, "prices_test.csv"),
  };
}

/**
 * Runs a one-command smoke test for structured CSV importers.
 * Order matters for linking: productions -> events -> tags -> blogs -> prices.
 */
async function runStructuredCsvSmokeTest(baseDir?: string) {
  const resolvedBaseDir = baseDir
    ? path.resolve(process.cwd(), baseDir)
    : path.resolve(process.cwd(), "..", "common", "res", "structured_test_csv");

  const csvPaths = buildStructuredCsvPaths(resolvedBaseDir);

  logger.info(
    `Structured CSV smoke test started. Base dir: ${resolvedBaseDir}`,
  );

  await injectProductionsCSV(csvPaths.productions);
  await injectEventsCSV(csvPaths.events);
  await injectTagsCSV(csvPaths.tags);
  await injectBlogsCSV(csvPaths.blogs);
  await injectPricesCSV(csvPaths.prices);

  logger.info("Structured CSV smoke test completed.");
}

const customBaseDir = process.argv[2];

void runStructuredCsvSmokeTest(customBaseDir).catch((error) => {
  logger.error("Structured CSV smoke test failed.", error);
  process.exitCode = 1;
});
