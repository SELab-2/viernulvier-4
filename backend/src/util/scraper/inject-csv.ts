import * as dotenv from "dotenv";
import * as path from "path";
import { UtilsDbConnection } from "./database/db.connection";
import logger from "../logger/logger";
import { AppLogger } from "../logger/logger.service";
import { LanguageService } from "../language/language.service";
import { OldCSVFileParser } from "../../csv_parsing/old_csv_file_parser";
import { CSVFileParser } from "../../csv_parsing/csv_file_parser";
import { vnvEvent, vnvGenre, vnvLocation, vnvProduction } from "./vnv.parser";
import { Language } from "@repo/common";

// Load DEV database env vars for script usage from root .env
dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

const DEFAULT_DATE = "1970-01-01T00:00:00+00:00";
const TRANSLATION_LANG_FROM: Language = "nl";
const TRANSLATION_LANG_TO: Language = "en";

let languageService: LanguageService | null = null;

function getLanguageService(): LanguageService | null {
  if (languageService) {
    return languageService;
  }

  if (!process.env.TRANSLATE_API_KEY) {
    logger.warn(
      "TRANSLATE_API_KEY is not set; CSV injection will continue without DeepL translation.",
    );
    return null;
  }

  try {
    languageService = new LanguageService(logger as unknown as AppLogger);
    return languageService;
  } catch (error) {
    logger.warn(
      `Failed to initialize LanguageService; continuing without translation: ${String(error)}`,
    );
    return null;
  }
}

async function translateBeforeInsert<T>(data: T): Promise<T> {
  const translator = getLanguageService();
  if (!translator) {
    return data;
  }

  return translator.translateObject<T>(
    data,
    TRANSLATION_LANG_FROM,
    TRANSLATION_LANG_TO,
  );
}

function toOldCsvTag(tagName: string): vnvGenre {
  return {
    legacy_id: `csv-${tagName}`,
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    name: { en: "", nl: tagName },
  };
}

function toOldCsvLocation(locationName: string): vnvLocation {
  return {
    legacy_id: `csv-${locationName}`,
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    name: { en: "", nl: locationName },
  };
}

function toOldCsvProduction(
  production: any,
  tagsForProduction: string[],
): vnvProduction {
  return {
    legacy_id: production.legacy_id,
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    performer_type: production.performer_type ?? "N/A",
    attendance_mode: production.attendance_mode ?? "N/A",
    title: production.titel,
    artist: production.artist ?? { en: "N/A", nl: "N/A" },
    tagline: production.tagline ?? { en: "N/A", nl: "N/A" },
    description: production.description1,
    description_2: production.description2 ?? { en: "N/A", nl: "N/A" },
    info: production.credits ?? { en: "N/A", nl: "N/A" },
    events: [],
    genres: tagsForProduction.map((t) => `csv-${t}`),
  };
}

function toOldCsvEvent(
  event: any,
  index: number,
  locationName: string,
): vnvEvent {
  return {
    legacy_id: `csv-${index}`,
    production_id: `csv-${event.production_id}`,
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    starts_at: event.starttime,
    ends_at: event.endtime ?? event.starttime,
    intermission_at: event.intermission_at ?? DEFAULT_DATE,
    doors_at: event.doors_at ?? DEFAULT_DATE,
    location: locationName ? `csv-${locationName}` : "N/A",
    prices: [],
  };
}

function toCsvLegacyIdFromNumericId(id: number): string {
  return `csv-${id}`;
}

function toCsvLocation(location: { en: string; nl: string }): vnvLocation {
  return {
    legacy_id: `csv-${location.nl}`,
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    name: {
      en: location.en,
      nl: location.nl,
    },
  };
}

function toCsvEvent(row: {
  event: any;
  legacy_id: string;
  locationLegacyId: string;
}): vnvEvent {
  const event = row.event;
  return {
    legacy_id: row.legacy_id,
    production_id: toCsvLegacyIdFromNumericId(event.production_id),
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    starts_at: event.starttime,
    ends_at: event.endtime ?? event.starttime,
    intermission_at: event.intermission_at ?? DEFAULT_DATE,
    doors_at: event.doors_at ?? DEFAULT_DATE,
    location: row.locationLegacyId,
    prices: [],
  };
}

function toCsvProduction(row: {
  production: any;
  legacy_id: string;
}): vnvProduction {
  const production = row.production;
  return {
    legacy_id: row.legacy_id,
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    performer_type: production.performer_type ?? "N/A",
    attendance_mode: production.attendance_mode ?? "N/A",
    title: production.titel,
    artist: production.artist ?? { en: "N/A", nl: "N/A" },
    tagline: production.tagline ?? { en: "N/A", nl: "N/A" },
    description: production.description1,
    description_2: production.description2 ?? { en: "N/A", nl: "N/A" },
    info: production.credits ?? { en: "N/A", nl: "N/A" },
    events: [],
    genres: [],
  };
}

/**
 * Import only productions from the structured CSV.
 * Can be run independently from other imports.
 */
export async function injectProductionsCSV(
  filePath: string,
  dbConnection: UtilsDbConnection = new UtilsDbConnection(),
) {
  logger.info(`Parsing productions CSV: ${filePath}`);

  const parsedProductions = await CSVFileParser.parseProductionsCSV(filePath);

  const csvProductions: vnvProduction[] = parsedProductions.map((row) =>
    toCsvProduction({
      production: row.production,
      legacy_id: row.legacy_id,
    }),
  );

  const translatedProductions =
    await translateBeforeInsert<vnvProduction[]>(csvProductions);

  await dbConnection.insertProductions(translatedProductions);
  logger.info("Structured productions CSV injection completed.");
}

/**
 * Import only events (+ locations) from the structured CSV.
 * Can be run independently from other imports.
 */
export async function injectEventsCSV(
  filePath: string,
  dbConnection: UtilsDbConnection = new UtilsDbConnection(),
) {
  logger.info(`Parsing events CSV: ${filePath}`);

  const parsedEvents = await CSVFileParser.parseEventsCSV(filePath);

  // deduplicate locations from events and convert to csvLocations
  const locationByName = new Map<string, vnvLocation>();
  for (const row of parsedEvents) {
    const key = `${row.location.en}||${row.location.nl}`;
    if (!locationByName.has(key)) {
      locationByName.set(key, toCsvLocation(row.location));
    }
  }

  const csvLocations: vnvLocation[] = Array.from(locationByName.values());

  const translatedLocations =
    await translateBeforeInsert<vnvLocation[]>(csvLocations);

  await dbConnection.insertLocations(translatedLocations);

  // Now that locations are inserted, we can convert events to csvEvents with locationLegacyIds
  const csvEvents: vnvEvent[] = parsedEvents.map((row) => {
    const locationKey = `${row.location.en}||${row.location.nl}`;
    const locationLegacyId =
      locationByName.get(locationKey)?.legacy_id ?? "csv-location-unknown";

    return toCsvEvent({
      event: row.event,
      legacy_id: row.legacy_id,
      locationLegacyId,
    });
  });

  const translatedEvents = await translateBeforeInsert<vnvEvent[]>(csvEvents);

  await dbConnection.insertEvents(translatedEvents);
  logger.info("Structured events CSV injection completed.");
}

/**
 * Import only tags from the structured CSV and link them to already existing productions.
 * Can be run independently from other imports.
 */
export async function injectTagsCSV(
  filePath: string,
  dbConnection: UtilsDbConnection = new UtilsDbConnection(),
) {
  logger.info(`Parsing tags CSV: ${filePath}`);

  const parsedTags = await CSVFileParser.parseTagsCSV(filePath);

  for (const row of parsedTags) {
    const translatedTagData = await translateBeforeInsert(row.tag);

    const tagLegacyId = "csv-" + translatedTagData.tag.nl;

    const tagId = await dbConnection.insertTag({
      legacy_id: tagLegacyId,
      created_at: DEFAULT_DATE,
      updated_at: DEFAULT_DATE,
      name: translatedTagData.tag,
    });

    for (const productionId of row.productionIds) {
      const productionLegacyId = toCsvLegacyIdFromNumericId(productionId);
      try {
        const production =
          await dbConnection.getProductionByLegacyId(productionLegacyId);
        await dbConnection.linkTag(production.id, tagId);
      } catch {
        logger.warn(
          `Skipping tag link; production not found for ${productionLegacyId}`,
        );
      }
    }
  }

  logger.info("Structured tags CSV injection completed.");
}

/**
 * Import only blogs from the structured CSV and link them to already existing productions.
 * Can be run independently from other imports.
 */
export async function injectBlogsCSV(
  filePath: string,
  dbConnection: UtilsDbConnection = new UtilsDbConnection(),
) {
  logger.info(`Parsing blogs CSV: ${filePath}`);

  const parsedBlogs = await CSVFileParser.parseBlogsCSV(filePath);

  for (const row of parsedBlogs) {
    const translatedBlogRow = await translateBeforeInsert(row);

    const productionLegacyId = toCsvLegacyIdFromNumericId(row.production_id);
    try {
      const production =
        await dbConnection.getProductionByLegacyId(productionLegacyId);

      const blog = await dbConnection.insertBlog(
        translatedBlogRow.blog.titel,
        translatedBlogRow.blog.description,
      );

      await dbConnection.linkBlog(production.id, blog.id);
    } catch {
      logger.warn(
        `Skipping blog link; production not found for ${productionLegacyId}`,
      );
    }
  }

  logger.info("Structured blogs CSV injection completed.");
}

/**
 * Import only prices from the structured CSV and link them to already existing events.
 * Can be run independently from other imports.
 */
export async function injectPricesCSV(
  filePath: string,
  dbConnection: UtilsDbConnection = new UtilsDbConnection(),
) {
  logger.info(`Parsing prices CSV: ${filePath}`);

  const parsedPrices = await CSVFileParser.parsePricesCSV(filePath);

  for (const row of parsedPrices) {
    const translatedPriceData = await translateBeforeInsert(row.price);

    const eventLegacyId = toCsvLegacyIdFromNumericId(row.event_id);
    try {
      const event = await dbConnection.getEventByLegacyId(eventLegacyId);

      const priceLegacyId = "csv-" + translatedPriceData.name.nl;

      const price = await dbConnection.insertPrice({
        legacy_id: priceLegacyId,
        created_at: DEFAULT_DATE,
        updated_at: DEFAULT_DATE,
        amount: translatedPriceData.price,
        name: translatedPriceData.name,
      });

      await dbConnection.linkPrice(event.id, price.id);
    } catch {
      logger.warn(`Skipping price link; event not found for ${eventLegacyId}`);
    }
  }

  logger.info("Structured prices CSV injection completed.");
}

export async function injectOldCsvData(
  dbConnection: UtilsDbConnection = new UtilsDbConnection(),
) {
  const productionsFile = "../common/res/productions_output.csv";
  const eventsFile = "../common/res/events_voorstellingen.csv";

  logger.info("Parsing CSV files...");
  const { productions, tags, productionTagLinks } =
    await OldCSVFileParser.parseOldProductionsCSV(productionsFile);
  const parsedEvents = await OldCSVFileParser.parseOldEventsCSV(eventsFile);

  const csvTags: vnvGenre[] = tags.map(toOldCsvTag);
  const csvProductions: vnvProduction[] = productions.map((production) =>
    toOldCsvProduction(
      production,
      productionTagLinks
        .filter((link) => link.legacyId === (production.legacy_id ?? ""))
        .map((link) => link.tagName),
    ),
  );

  // deduplicate locations from events and convert to csvLocations
  const locationNames = new Set(
    parsedEvents.map((row) => row.location.trim()).filter(Boolean),
  );
  const csvLocations: vnvLocation[] =
    Array.from(locationNames).map(toOldCsvLocation);

  const csvEvents: vnvEvent[] = parsedEvents.map((row, index) =>
    toOldCsvEvent(row.event, index, row.location.trim()),
  );

  const translatedTags = await translateBeforeInsert<vnvGenre[]>(csvTags);
  const translatedLocations =
    await translateBeforeInsert<vnvLocation[]>(csvLocations);
  const translatedProductions =
    await translateBeforeInsert<vnvProduction[]>(csvProductions);
  const translatedEvents = await translateBeforeInsert<vnvEvent[]>(csvEvents);

  logger.info(
    "Injecting CSV data into DEV database using DbConnection insert functions...",
  );

  await Promise.all([
    dbConnection.insertTags(translatedTags),
    dbConnection.insertLocations(translatedLocations),
  ]);

  await dbConnection.insertProductions(translatedProductions);
  await dbConnection.insertEvents(translatedEvents);

  logger.info("CSV injection completed.");
}
