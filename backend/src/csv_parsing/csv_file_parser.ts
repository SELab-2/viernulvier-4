import fs from "fs";
import csvParser from "csv-parser";
import { z, string, ZodType } from "zod";
import {
  CreateBlogDto,
  CreateEventDto,
  CreatePriceDto,
  CreateProductionDto,
  CreateTagDto,
} from "../dto/dto";
import {
  CreateBlogSchema,
  CreateEventSchema,
  CreatePriceSchema,
  CreateProductionSchema,
  CreateTagSchema,
} from "@repo/common";

/**
 * Type used to structure production import
 */
type ParsedProductionImport = {
  productions: (CreateProductionDto & { legacy_id: string })[];
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

/**
 * Internal helper used when parsing prices.
 */
type ParsedPriceRow = {
  price: CreatePriceDto;
  event_id: number;
};

/**
 * Internal helper used when parsing blogs.
 */
type ParsedBlogRow = {
  blog: CreateBlogDto;
  production_id: number;
};

/**
 * Internal helper used when parsing tags.
 */
type ParsedTagRow = {
  tag: CreateTagDto;
  productionIds: number[];
};

export class CSVFileParser {
  private static toLocalizedString(value: string): { en: string; nl: string } {
    const normalized = (value || "").trim();
    return {
      en: normalized,
      nl: normalized,
    };
  }

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

  static transformOldEventRow(
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
    };
  }

  static transformOldProductionRow(
    row: Record<string, string>,
  ): CreateProductionDto & { tags: string[]; legacy_id: string } {
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
      titel: CSVFileParser.toLocalizedString(row.Titel),
      description1: CSVFileParser.toLocalizedString(row.Description1),
      description2: row.Description2
        ? CSVFileParser.toLocalizedString(row.Description2)
        : null,
      artist: null, // TODO
      tagline: tagLine ? CSVFileParser.toLocalizedString(tagLine) : null,
      credits: null, // TODO
      attendance_mode: null, // TODO
      performer_type: null, // TODO
      legacy_id: legacy_id,
      tags: [...new Set(tags)], // remove duplicate tags
    };
  }

  static transformPriceRow(
    row: Record<string, string>,
  ): CreatePriceDto & { event_id: number } {
    const name_nl = row.Name_NL;
    if (!name_nl) {
      throw new Error(`Name_NL is required: ${row.Name_NL}`);
    }
    const name_en = row.Name_EN || name_nl;
    const price = Number(row.Price);
    const eventId = Number(row.EventID);

    if (isNaN(price)) {
      throw new Error(`Invalid price: ${row.Price}`);
    }
    if (isNaN(eventId)) {
      throw new Error(`Invalid event id: ${row.EventID}`);
    }

    return {
      name: { en: name_en, nl: name_nl },
      price,
      event_id: eventId,
    };
  }

  static transformBlogRow(
    row: Record<string, string>,
  ): CreateBlogDto & { production_id: number } {
    const title_nl = row.Titel_NL;
    if (!title_nl) {
      throw new Error(`Titel_NL is required: ${row.Titel_NL}`);
    }
    const title_en = row.Titel_EN || title_nl;
    const description_nl = row.Description_NL;
    if (!description_nl) {
      throw new Error(`Description_NL is required: ${row.Description_NL}`);
    }
    const description_en = row.Description_EN || description_nl;
    const productionId = Number(row.ProductionID);
    if (isNaN(productionId)) {
      throw new Error(`Invalid production id: ${row.ProductionID}`);
    }

    return {
      titel: { en: title_en, nl: title_nl },
      description: { en: description_en, nl: description_nl },
      production_id: productionId,
    };
  }

  static transformTagRow(
    row: Record<string, string>,
  ): CreateTagDto & { productionIds: number[] } {
    const tagName_nl = row.TagName_NL;
    if (!tagName_nl) {
      throw new Error(`TagName_NL is required: ${row.TagName_NL}`);
    }
    const tagName_en = row.TagName_EN || tagName_nl;
    const productionIds = (row.ProductionIDs || "").split(",").map((id) => {
      const numId = Number(id.trim());
      if (isNaN(numId)) {
        throw new Error(`Invalid production id in ProductionIDs: ${id}`);
      }
      return numId;
    });

    return {
      tag: { en: tagName_en, nl: tagName_nl },
      productionIds,
    };
  }

  /**
   * Parse events from an old CSV file and return them along with a raw location
   * string.
   * @param filePath - Path to the CSV file containing events
   * @return A promise that resolves to an array of objects containing the
   *         event DTO and the value of the `Hall` column (may be empty).
   */
  static async parseOldEventsCSV(filePath: string): Promise<ParsedEventRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreateEventDto & { location: string }
    >(
      filePath,
      CreateEventSchema.extend({ location: string() }),
      this.transformOldEventRow,
    );

    return parsed.map((r) => {
      const { location, ...eventData } = r;
      return { event: eventData, location: location };
    });
  }

  /**
   * Parse productions from an old CSV file and return structured import data
   * @param filePath - Path to the CSV file containing productions
   * @return A promise that resolves to an object containing productions, unique tags, and production-tag links
   */
  static async parseOldProductionsCSV(
    filePath: string,
  ): Promise<ParsedProductionImport> {
    const productions: (CreateProductionDto & { legacy_id: string })[] = [];
    const tagsSet: Set<string> = new Set();
    const productionTagLinks: { legacyId: string; tagName: string }[] = [];

    const parsed = await this.parseCSVWithSchema<
      CreateProductionDto & { tags: string[]; legacy_id: string }
    >(
      filePath,
      CreateProductionSchema.extend({
        tags: string().array(),
        legacy_id: string(),
      }),
      this.transformOldProductionRow,
    );

    for (const production of parsed) {
      const { tags, ...prodData } = production;
      productions.push(prodData);

      for (const tag of tags) {
        tagsSet.add(tag);
        productionTagLinks.push({
          legacyId: prodData.legacy_id,
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
   * Parse prices from a CSV file and return them along with their associated event IDs
   * @param filePath - Path to the CSV file containing prices
   * @return A promise that resolves to an array of objects containing the price DTO and the associated event ID
   */
  static async parsePricesCSV(filePath: string): Promise<ParsedPriceRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreatePriceDto & { event_id: number }
    >(
      filePath,
      CreatePriceSchema.extend({ event_id: z.number() }),
      this.transformPriceRow,
    );

    return parsed.map((r) => {
      const { event_id, ...priceData } = r;
      return { price: priceData, event_id };
    });
  }

  /**
   * Parse blogs from a CSV file and return them along with their associated production IDs
   * @param filePath - Path to the CSV file containing blogs
   * @return A promise that resolves to an array of objects containing the blog DTO and the associated production ID
   */
  static async parseBlogsCSV(filePath: string): Promise<ParsedBlogRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreateBlogDto & { production_id: number }
    >(
      filePath,
      CreateBlogSchema.extend({ production_id: z.number() }),
      this.transformBlogRow,
    );

    return parsed.map((r) => {
      const { production_id, ...blogData } = r;
      return { blog: blogData, production_id };
    });
  }

  /**
   * Parse tags from a CSV file and return them along with their associated production IDs
   * @param filePath - Path to the CSV file containing tags
   * @return A promise that resolves to an array of objects containing the tag DTO and an array of associated production IDs
   */
  static async parseTagsCSV(filePath: string): Promise<ParsedTagRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreateTagDto & { productionIds: number[] }
    >(
      filePath,
      CreateTagSchema.extend({ productionIds: z.number().array() }),
      this.transformTagRow,
    );

    return parsed.map((r) => {
      const { productionIds, ...tagData } = r;
      return { tag: tagData, productionIds };
    });
  }
}
