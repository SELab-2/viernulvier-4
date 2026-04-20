import { LanguageService } from "../../language/language.service";
import { OldCSVFileParser } from "../../../csv_parsing/old_csv_file_parser";
import {
  CSVFileParser,
  CsvInputSource,
} from "../../../csv_parsing/csv_file_parser";
import { vnvEvent, vnvGenre, vnvLocation, vnvProduction } from "../vnv.parser";
import { Language } from "@repo/common";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "../../logger/logger.service";
import { CreateEventDto, CreateProductionDto } from "../../../dto/dto";
import { ResourceNotFoundException } from "../../../common/exceptions";
import { ScraperDbManager } from "../database/scraper.db.facade";

const DEFAULT_DATE = "1970-01-01T00:00:00+00:00";
const TRANSLATION_LANG_FROM: Language = "nl";
const TRANSLATION_LANG_TO: Language = "en";

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
  production: CreateProductionDto & { legacy_id: string },
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
    galleryId: "",
  };
}

function toOldCsvEvent(
  event: CreateEventDto,
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

@Injectable()
export class InjectCsvEngine {
  constructor(
    private readonly scraperDbManager: ScraperDbManager,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly languageService: LanguageService,
  ) {}

  /**
   * Import only productions from the structured CSV.
   * Can be run independently from other imports.
   */
  async injectProductionsCSV(input: CsvInputSource) {
    this.logger.log(`Parsing productions CSV: ${this.describeCsvInput(input)}`);

    const parsedProductions = await CSVFileParser.parseProductionsCSV(input);

    const csvProductions: vnvProduction[] = parsedProductions.map((row) =>
      this.toCsvProduction({
        production: row.production,
        legacy_id: row.legacy_id,
      }),
    );

    const translatedProductions =
      await this.translateBeforeInsert<vnvProduction[]>(csvProductions);

    await this.scraperDbManager.production.insertProductions(
      translatedProductions,
    );
    this.logger.log("Structured productions CSV injection completed.");
  }

  /**
   * Import only events (+ locations) from the structured CSV.
   * Can be run independently from other imports.
   */
  async injectEventsCSV(input: CsvInputSource) {
    this.logger.log(`Parsing events CSV: ${this.describeCsvInput(input)}`);

    const parsedEvents = await CSVFileParser.parseEventsCSV(input);

    // deduplicate locations from events and convert to csvLocations
    const locationByName = new Map<string, vnvLocation>();
    for (const row of parsedEvents) {
      const key = `${row.location.en}||${row.location.nl}`;
      if (!locationByName.has(key)) {
        locationByName.set(key, this.toCsvLocation(row.location));
      }
    }

    const csvLocations: vnvLocation[] = Array.from(locationByName.values());

    const translatedLocations =
      await this.translateBeforeInsert<vnvLocation[]>(csvLocations);

    await this.scraperDbManager.taxonomies.insertLocations(translatedLocations);

    // Now that locations are inserted, we can convert events to csvEvents with locationLegacyIds
    const csvEvents: vnvEvent[] = parsedEvents.map((row) => {
      const locationKey = `${row.location.en}||${row.location.nl}`;
      const locationLegacyId =
        locationByName.get(locationKey)?.legacy_id ?? "csv-location-unknown";

      return this.toCsvEvent({
        event: row.event,
        legacy_id: row.legacy_id,
        locationLegacyId,
      });
    });

    const translatedEvents =
      await this.translateBeforeInsert<vnvEvent[]>(csvEvents);

    await this.scraperDbManager.event.insertEvents(translatedEvents);
    this.logger.log("Structured events CSV injection completed.");
  }

  /**
   * Import only tags from the structured CSV and link them to already existing productions.
   * Can be run independently from other imports.
   */
  async injectTagsCSV(input: CsvInputSource) {
    this.logger.log(`Parsing tags CSV: ${this.describeCsvInput(input)}`);

    const parsedTags = await CSVFileParser.parseTagsCSV(input);

    for (const row of parsedTags) {
      const translatedTagData = await this.translateBeforeInsert(row.tag);

      const tagLegacyId = "csv-" + translatedTagData.tag.nl;

      const tagId = await this.scraperDbManager.taxonomies.insertTag({
        legacy_id: tagLegacyId,
        created_at: DEFAULT_DATE,
        updated_at: DEFAULT_DATE,
        name: translatedTagData.tag,
      });

      for (const productionId of row.productionIds) {
        const productionLegacyId =
          this.toCsvLegacyIdFromNumericId(productionId);
        try {
          const production =
            await this.scraperDbManager.production.getProductionByLegacyId(
              productionLegacyId,
            );
          await this.scraperDbManager.production.linkTag(production.id, tagId);
        } catch (error) {
          if (error instanceof ResourceNotFoundException) {
            this.logger.warn(
              `Skipping tag link; production not found for ${productionLegacyId}`,
            );
            continue;
          }

          this.logger.error(
            `Unexpected error while linking tag to production ${productionLegacyId}: ${(error as Error).message}`,
          );
        }
      }
    }

    this.logger.log("Structured tags CSV injection completed.");
  }

  /**
   * Import only blogs from the structured CSV and link them to already existing productions.
   * Can be run independently from other imports.
   */
  async injectBlogsCSV(input: CsvInputSource) {
    this.logger.log(`Parsing blogs CSV: ${this.describeCsvInput(input)}`);

    const parsedBlogs = await CSVFileParser.parseBlogsCSV(input);

    for (const row of parsedBlogs) {
      const translatedBlogRow = await this.translateBeforeInsert(row);

      const productionLegacyId = this.toCsvLegacyIdFromNumericId(
        row.production_id,
      );
      try {
        const production =
          await this.scraperDbManager.production.getProductionByLegacyId(
            productionLegacyId,
          );

        const blog = await this.scraperDbManager.blog.insertBlog(
          translatedBlogRow.blog.titel,
          translatedBlogRow.blog.description,
        );

        await this.scraperDbManager.blog.linkBlog(production.id, blog.id);
      } catch (error) {
        if (error instanceof ResourceNotFoundException) {
          this.logger.warn(
            `Skipping blog link; production not found for ${productionLegacyId}`,
          );
          continue;
        }

        this.logger.error(
          `Unexpected error while linking blog to production ${productionLegacyId}: ${(error as Error).message}`,
        );
      }
    }

    this.logger.log("Structured blogs CSV injection completed.");
  }

  /**
   * Import only prices from the structured CSV and link them to already existing events.
   * Can be run independently from other imports.
   */
  async injectPricesCSV(input: CsvInputSource) {
    this.logger.log(`Parsing prices CSV: ${this.describeCsvInput(input)}`);

    const parsedPrices = await CSVFileParser.parsePricesCSV(input);

    for (const row of parsedPrices) {
      const translatedPriceData = await this.translateBeforeInsert(row.price);

      const eventLegacyId = this.toCsvLegacyIdFromNumericId(row.event_id);
      try {
        const event =
          await this.scraperDbManager.event.getEventByLegacyId(eventLegacyId);

        const priceLegacyId = "csv-" + translatedPriceData.name.nl;

        const price = await this.scraperDbManager.taxonomies.insertPrice({
          legacy_id: priceLegacyId,
          created_at: DEFAULT_DATE,
          updated_at: DEFAULT_DATE,
          amount: translatedPriceData.price,
          name: translatedPriceData.name,
        });

        await this.scraperDbManager.event.linkPrice(event.id, price.id);
      } catch (error) {
        if (error instanceof ResourceNotFoundException) {
          this.logger.warn(
            `Skipping price link; event not found for ${eventLegacyId}`,
          );
          continue;
        }

        this.logger.error(
          `Unexpected error while linking price to event ${eventLegacyId}: ${(error as Error).message}`,
        );
      }
    }

    this.logger.log("Structured prices CSV injection completed.");
  }

  async injectOldCsvData() {
    const productionsFile = this.configService.get<string>(
      "OLD_CSV_PRODUCTIONS_FILE",
      "../common/res/productions_output.csv",
    );
    const eventsFile = this.configService.get<string>(
      "OLD_CSV_EVENTS_FILE",
      "../common/res/events_voorstellingen.csv",
    );

    this.logger.log("Parsing CSV files...");
    const { productions, tags, productionTagLinks } =
      await OldCSVFileParser.parseOldProductionsCSV(productionsFile);
    const parsedEvents = await OldCSVFileParser.parseOldEventsCSV(eventsFile);

    // Build a fast lookup from production legacy id to tag names.
    const tagsByProductionLegacyId = new Map<string, string[]>();
    for (const link of productionTagLinks) {
      const existingTags = tagsByProductionLegacyId.get(link.legacyId);
      if (existingTags) {
        existingTags.push(link.tagName);
      } else {
        tagsByProductionLegacyId.set(link.legacyId, [link.tagName]);
      }
    }

    const csvTags: vnvGenre[] = tags.map(toOldCsvTag);
    const csvProductions: vnvProduction[] = productions.map((production) =>
      toOldCsvProduction(
        production,
        tagsByProductionLegacyId.get(production.legacy_id ?? "") ?? [],
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

    const translatedTags =
      await this.translateBeforeInsert<vnvGenre[]>(csvTags);
    const translatedLocations =
      await this.translateBeforeInsert<vnvLocation[]>(csvLocations);
    const translatedProductions =
      await this.translateBeforeInsert<vnvProduction[]>(csvProductions);
    const translatedEvents =
      await this.translateBeforeInsert<vnvEvent[]>(csvEvents);

    this.logger.log(
      "Injecting CSV data into DEV database using DbConnection insert functions...",
    );

    await Promise.all([
      this.scraperDbManager.taxonomies.insertTags(translatedTags),
      this.scraperDbManager.taxonomies.insertLocations(translatedLocations),
    ]);

    await this.scraperDbManager.production.insertProductions(
      translatedProductions,
    );
    await this.scraperDbManager.event.insertEvents(translatedEvents);

    this.logger.log("CSV injection completed.");
  }

  private async translateBeforeInsert<T>(data: T): Promise<T> {
    this.logger.debug(
      `[translation] started (${TRANSLATION_LANG_FROM} -> ${TRANSLATION_LANG_TO})`,
    );

    const translated = await this.languageService.translateObject<T>(
      data,
      TRANSLATION_LANG_FROM,
      TRANSLATION_LANG_TO,
    );

    this.logger.debug(
      `[translation] finished (${TRANSLATION_LANG_FROM} -> ${TRANSLATION_LANG_TO})`,
    );

    return translated;
  }

  private toCsvLegacyIdFromNumericId(id: number): string {
    return `csv-${id}`;
  }

  private toCsvLocation(location: { en: string; nl: string }): vnvLocation {
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

  private toCsvEvent(row: {
    event: CreateEventDto;
    legacy_id: string;
    locationLegacyId: string;
  }): vnvEvent {
    const event = row.event;
    return {
      legacy_id: row.legacy_id,
      production_id: this.toCsvLegacyIdFromNumericId(event.production_id),
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

  private toCsvProduction(row: {
    production: CreateProductionDto;
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
      galleryId: "",
    };
  }

  /**
   * Helper to describe the CSV input source for logging purposes.
   */
  private describeCsvInput(input: CsvInputSource): string {
    return typeof input === "string"
      ? input
      : `uploaded file buffer (${input.length} bytes)`;
  }
}
