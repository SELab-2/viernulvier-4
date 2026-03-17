import * as dotenv from "dotenv";
import * as path from "path";
import { UtilsDbConnection } from "./database/db.connection";
import logger from "../logger/logger";
import { CSVFileParser } from "../../csv_parsing/csv_file_parser";
import { vnvEvent, vnvGenre, vnvLocation, vnvProduction } from "./vnv.parser";

// Load DEV database env vars for script usage from root .env
dotenv.config({ path: path.join(process.cwd(), ".env") });

const DEFAULT_DATE = "1970-01-01T00:00:00+00:00";

function toCsvTag(tagName: string): vnvGenre {
  return {
    legacy_id: `csv-${tagName}`,
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    name: { en: tagName, nl: tagName }, //TODO translate with Google Translate API
  };
}

function toCsvLocation(locationName: string): vnvLocation {
  return {
    legacy_id: `csv-${locationName}`,
    created_at: DEFAULT_DATE,
    updated_at: DEFAULT_DATE,
    name: { en: locationName, nl: locationName }, //TODO translate with Google Translate API
  };
}

function toCsvProduction(
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

function toCsvEvent(event: any, index: number, locationName: string): vnvEvent {
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

export async function injectCsvData() {
  const dbConnection = new UtilsDbConnection();

  const productionsFile = "../common/res/productions_output.csv";
  const eventsFile = "../common/res/events_voorstellingen.csv";

  logger.info("Parsing CSV files...");
  const { productions, tags, productionTagLinks } =
    await CSVFileParser.parseProductionsCSV(productionsFile);
  const parsedEvents = await CSVFileParser.parseEventsCSV(eventsFile);

  const csvTags: vnvGenre[] = tags.map(toCsvTag);
  const csvProductions: vnvProduction[] = productions.map((production) =>
    toCsvProduction(
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
    Array.from(locationNames).map(toCsvLocation);

  const csvEvents: vnvEvent[] = parsedEvents.map((row, index) =>
    toCsvEvent(row.event, index, row.location.trim()),
  );

  logger.info(
    "Injecting CSV data into DEV database using DbConnection insert functions...",
  );

  await Promise.all([
    dbConnection.insertTags(csvTags),
    dbConnection.insertLocations(csvLocations),
  ]);

  await dbConnection.insertProductions(csvProductions);
  await dbConnection.insertEvents(csvEvents);

  logger.info("CSV injection completed.");
}
