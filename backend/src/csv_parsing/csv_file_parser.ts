import fs from "fs";
import csvParser from "csv-parser";
import { string, ZodType } from "zod";
import {
  CreateEventDto,
  CreateProductionDto,
  EventDto,
  ProductionDto,
  TagDto,
} from "../dto/dto";
import { CreateEventSchema, CreateProductionSchema } from "@repo/common";
import { EventService } from "../event/event.service";
import { ProductionService } from "../production/production.service";
import { TagService } from "../tag/tag.service";
import { LocationService } from "../location/location.service";

/**
 * Type used to structure production import
 */
type ParsedProductionImport = {
  productions: CreateProductionDto[];
  tags: string[];
  productionTagLinks: { legacyId: string; tagName: string }[];
};

/**
 * Internal helper used when parsing events.
 */
type ParsedEventRow = {
  event: CreateEventDto;
  location: string;
};

export class CSVFileParser {
  /**
   * Parse a CSV file and return the data as an array of objects
   * @param filePath - Path to the CSV file
   * @param schema - Zod schema to validate the parsed data
   * @param transform - Function to transform each row of the CSV into the desired format
   * @returns A promise that resolves to an array of parsed and validated objects
   */
  static parseCSVWithSchema<T>(
    filePath: string,
    schema: ZodType<T>,
    transform: (row: Record<string, string>) => T,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let settled = false; // prevent multiple resolve/reject calls

      const stream = fs.createReadStream(filePath).pipe(
        csvParser({
          strict: true, // Enable strict mode to catch parsing errors
          mapHeaders: ({ header }) => header.trim(), // Trim whitespace from headers
          mapValues: ({ value }) => value.trim(), // Trim whitespace from values
        }),
      );

      const cleanupAndReject = (error: unknown) => {
        if (settled) return;
        settled = true;

        stream.destroy(); // stop reading immediately
        reject(error instanceof Error ? error : new Error(String(error)));
      };

      stream.on("data", (row: Record<string, string>) => {
        if (settled) return; // ignore data if already settled
        try {
          // apply the transformation function to the row and validate it against the schema
          const transformedRow: T = transform(row);
          // try to parse the transformed row with the schema, if it fails, catch the error and reject the promise
          const validationResult: T = schema.parse(transformedRow);
          results.push(validationResult);
        } catch (error) {
          console.warn(
            `Skipping invalid row: ${JSON.stringify(row)} - ${error}`,
          );
        }
      });

      stream.on("end", () => {
        if (settled) return;
        settled = true;
        resolve(results);
      });

      stream.on("error", (error) => {
        cleanupAndReject(new Error(`Error reading CSV file: ${error.message}`));
      });
    });
  }

  static transformEventRow(
    row: Record<string, string>,
  ): CreateEventDto & { location: string } {
    let endTime: string | null = null;

    // Check for invalid date formats and handle them accordingly
    const invalidDates = ["0000-00-00 00:00:00", "1970-01-01 00:00:00", ""];
    const starttimeDate = new Date(row.Starttime);
    if (isNaN(starttimeDate.getTime())) {
      throw new Error(`Invalid starttime: ${row.Starttime}`);
    }
    if (row.Endtime && !invalidDates.includes(row.Endtime)) {
      const endTimeDate = new Date(row.Endtime);
      if (!isNaN(endTimeDate.getTime()) && endTimeDate > starttimeDate)
        endTime = endTimeDate.toISOString();
    }

    const productionId = Number(row.Production);
    if (isNaN(productionId)) {
      throw new Error(`Invalid production id: ${row.Production}`);
    }

    const location = (row.Hall || "").trim();

    return {
      starttime: starttimeDate.toISOString(),
      endtime: endTime,
      production_id: productionId,
      location: location,
      doors_at: null, // TODO
      intermission_at: null, // TODO
      legacy_id: null,
    };
  }

  static transformProductionRow(
    row: Record<string, string>,
  ): CreateProductionDto & { tags: string[] } {
    // validate and convert numeric fields manually to provide clearer errors
    const id = Number(row.ID);
    if (isNaN(id)) {
      throw new Error(`Invalid production id: ${row.ID}`);
    }

    // adds possibility to add tags as a comma separated list in the Genre column, trims whitespace and converts to lowercase for consistency
    const tags = (row.Genre || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const tagLine = row.Tagline || row.Ondertitel || null;

    const legacy_id = `csv-${id}`;

    return {
      titel: row.Titel,
      description1: row.Description1,
      description2: row.Description2 || null,
      artist: null, // TODO
      tagline: tagLine,
      credits: null, // TODO
      attendance_mode: null, // TODO
      performer_type: null, // TODO
      legacy_id: legacy_id,
      tags: [...new Set(tags)], // remove duplicate tags
    };
  }

  /**
   * Parse events from a CSV file and return them along with a raw location
   * string.
   * @param filePath - Path to the CSV file containing events
   * @return A promise that resolves to an array of objects containing the
   *         event DTO and the value of the `Hall` column (may be empty).
   */
  static async parseEventsCSV(filePath: string): Promise<ParsedEventRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreateEventDto & { location: string }
    >(
      filePath,
      CreateEventSchema.extend({ location: string() }),
      this.transformEventRow,
    );

    return parsed.map((r) => {
      const { location, ...eventData } = r;
      return { event: eventData, location: location };
    });
  }

  /**
   * Parse productions from a CSV file and return structured import data
   * @param filePath - Path to the CSV file containing productions
   * @return A promise that resolves to an object containing productions, unique tags, and production-tag links
   */
  static async parseProductionsCSV(
    filePath: string,
  ): Promise<ParsedProductionImport> {
    const productions: CreateProductionDto[] = [];
    const tagsSet: Set<string> = new Set();
    const productionTagLinks: { legacyId: string; tagName: string }[] = [];

    const parsed = await this.parseCSVWithSchema<
      CreateProductionDto & { tags: string[] }
    >(
      filePath,
      CreateProductionSchema.extend({ tags: string().array() }),
      this.transformProductionRow,
    );

    for (const production of parsed) {
      const { tags, ...prodData } = production;
      productions.push(prodData);

      for (const tag of tags) {
        tagsSet.add(tag);
        productionTagLinks.push({
          legacyId: prodData.legacy_id!,
          tagName: tag,
        });
      }
    }

    return {
      productions: productions,
      tags: Array.from(tagsSet),
      productionTagLinks,
    };
  }

  /**
   * Parse events from a CSV file and insert them into the database.
   * @param filePath - Path to the CSV file containing events
   * @param eventService - Instance of EventService to insert events into the database
   * @param locationService - Instance of LocationService to insert locations into the database
   * @returns A promise that resolves to an array of created EventDto objects
   */
  static async insertEventsFromCSV(
    filePath: string,
    eventService: EventService,
    locationService: LocationService,
  ): Promise<EventDto[]> {
    const parsed = await this.parseEventsCSV(filePath);
    const createdEvents: EventDto[] = [];

    // prepopulate a map with existing locations so we don't create duplicates
    const locationMap: Map<string, number> = new Map();
    const existingLoc = await locationService.getLocations();
    for (const loc of existingLoc) {
      locationMap.set(loc.location, loc.id);
    }

    for (const { event, location } of parsed) {
      try {
        let locId: number | null = null;
        const loc = location.trim();

        // if there's a location, either find it in the map or create it and add to the map
        if (loc) {
          if (locationMap.has(loc)) {
            locId = locationMap.get(loc)!;
          } else {
            const createdLoc = await locationService.createLocation({
              location: loc,
              legacy_id: null,
            });

            if (!createdLoc) {
              throw new Error("Location creation failed");
            }

            locId = createdLoc.id;
            locationMap.set(loc, locId);
          }
        }

        //create the event and link it to the location if applicable
        const createdEvent = await eventService.createEvent(event);

        if (locId !== null) {
          await eventService.linkEventToLocation(createdEvent.id, locId);
        }

        createdEvents.push(createdEvent);
      } catch (error) {
        throw new Error(
          `Failed to insert event: ${JSON.stringify(event)} - ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return createdEvents;
  }

  /**
   * Parse productions from a CSV file and insert them into the database, along with their associated tags.
   * @param filePath - Path to the CSV file containing productions
   * @param productionService - Instance of ProductionService to insert productions into the database and link tags
   * @param tagService - Instance of TagService to insert tags into the database
   * @returns A promise that resolves when all productions and tags have been inserted and linked
   */
  static async insertProductionsFromCSV(
    filePath: string,
    productionService: ProductionService,
    tagService: TagService,
  ): Promise<ProductionDto[]> {
    const { productions, tags, productionTagLinks } =
      await this.parseProductionsCSV(filePath);
    const createdProductions: ProductionDto[] = [];

    const legacyToDbId = new Map<string, number>();

    // insert productions
    for (const production of productions) {
      const created = await productionService.createProduction(production);
      createdProductions.push(created);

      if (production.legacy_id) {
        legacyToDbId.set(production.legacy_id, created.id);
      }
    }

    // prepopulate a map with existing locations so we don't create duplicates
    const tagMap: Map<string, number> = new Map();
    const existingTags = await tagService.getAllTags();
    for (const tag of existingTags) {
      tagMap.set(tag.tag, tag.id);
    }

    for (const tagName of tags) {
      if (!tagMap.has(tagName)) {
        // insert tags, ignoring duplicates
        const tagObject: TagDto = await tagService.createTag({
          tag: tagName,
          legacy_id: null,
        });
        tagMap.set(tagName, tagObject.id);
      }
    }

    // link tags to productions
    for (const link of productionTagLinks) {
      const tagId = tagMap.get(link.tagName);
      const prodId = legacyToDbId.get(link.legacyId);
      if (!prodId || !tagId) continue;
      await productionService.addTagToProduction(prodId, tagId);
    }

    return createdProductions;
  }

  //TODO: add inserting function for productions once new insert endpoint is added to backend
}
