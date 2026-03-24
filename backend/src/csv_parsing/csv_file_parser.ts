import fs from "fs";
import { Readable } from "stream";
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
 * Internal helper used when parsing localized events.
 */
type ParsedLocalizedEventRow = {
  event: CreateEventDto;
  location: { en: string; nl: string };
  legacy_id: string;
};

/**
 * Internal helper used when parsing productions.
 */
type ParsedProductionRow = {
  production: CreateProductionDto;
  legacy_id: string;
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

/// Type used to describe the CSV input source, can be either a file path or a buffer containing the CSV data.
export type CsvInputSource = string | Buffer;

export class CSVFileParser {
  private static toLocalizedString(
    value_nl: string,
    value_en: string,
    required_nl: boolean,
    required_en: boolean,
  ): { en: string; nl: string } {
    const nl = (value_nl || "").trim();
    const en = (value_en || "").trim();

    if (required_nl && !nl) {
      throw new Error(`Required Dutch value is missing: ${value_nl}`);
    }
    if (required_en && !en) {
      throw new Error(`Required English value is missing: ${value_en}`);
    }

    if (!en && nl) {
      //translating will be done before inserting
      return { en: "", nl };
    }

    return { en, nl };
  }

  /**
   * Parse a CSV file and return the data as an array of objects
   * @param filePath - Path to the CSV file
   * @param schema - Zod schema to validate the parsed data
   * @param transform - Function to transform each row of the CSV into the desired format
   * @returns A promise that resolves to an array of parsed and validated objects
   */
  static parseCSVWithSchema<T>(
    input: CsvInputSource,
    schema: ZodType<T>,
    transform: (row: Record<string, string>) => T,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let settled = false; // prevent multiple resolve/reject calls

      const sourceStream =
        typeof input === "string"
          ? fs.createReadStream(input)
          : Readable.from([input.toString("utf8")]); // converts buffer into a readable stream so parser can process it.

      const stream = sourceStream.pipe(
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

  static transformEventRow(row: Record<string, string>): CreateEventDto & {
    location: { en: string; nl: string };
    legacy_id: string;
  } {
    const id = Number(row.ID);
    if (isNaN(id)) {
      throw new Error(`Invalid production id: ${row.ID}`);
    }
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

    let doorsAt: string | null = null;
    if (row.DoorsAt) {
      const doorsAtDate = new Date(row.DoorsAt);
      if (!isNaN(doorsAtDate.getTime()) && doorsAtDate < starttimeDate) {
        doorsAt = doorsAtDate.toISOString();
      }
    }

    let intermissionAt: string | null = null;
    if (row.IntermissionAt) {
      const intermissionAtDate = new Date(row.IntermissionAt);
      if (!isNaN(intermissionAtDate.getTime())) {
        intermissionAt = intermissionAtDate.toISOString();
      }
    }

    const productionId = Number(row.Production);
    if (isNaN(productionId)) {
      throw new Error(`Invalid production id: ${row.Production}`);
    }

    const location = CSVFileParser.toLocalizedString(
      row.Location_NL,
      row.Location_EN,
      false,
      false,
    );

    return {
      starttime: starttimeDate.toISOString(),
      endtime: endTime,
      production_id: productionId,
      location,
      doors_at: doorsAt,
      intermission_at: intermissionAt,
      legacy_id: `csv-${id}`,
    };
  }

  static transformProductionRow(
    row: Record<string, string>,
  ): CreateProductionDto & { legacy_id: string } {
    // validate and convert numeric fields manually to provide clearer errors
    const id = Number(row.ID);
    if (isNaN(id)) {
      throw new Error(`Invalid production id: ${row.ID}`);
    }

    const titel = CSVFileParser.toLocalizedString(
      row.Titel_NL,
      row.Titel_EN,
      true,
      false,
    );
    const description1 = CSVFileParser.toLocalizedString(
      row.Description1_NL,
      row.Description1_EN,
      true,
      false,
    );
    const description2Value = CSVFileParser.toLocalizedString(
      row.Description2_NL,
      row.Description2_EN,
      false,
      false,
    );
    const description2 =
      description2Value.en || description2Value.nl ? description2Value : null;

    const artistValue = CSVFileParser.toLocalizedString(
      row.Artist_NL,
      row.Artist_EN,
      false,
      false,
    );
    const artist = artistValue.en || artistValue.nl ? artistValue : null;

    const taglineValue = CSVFileParser.toLocalizedString(
      row.Tagline_NL,
      row.Tagline_EN,
      false,
      false,
    );
    const tagline = taglineValue.en || taglineValue.nl ? taglineValue : null;

    const creditsValue = CSVFileParser.toLocalizedString(
      row.Credits_NL,
      row.Credits_EN,
      false,
      false,
    );
    const credits = creditsValue.en || creditsValue.nl ? creditsValue : null;

    const performer_type = (row.Performer_Type || "").trim() || null;
    const attendance_mode = (row.Attendance_Mode || "").trim() || null;

    return {
      titel,
      description1,
      description2,
      artist,
      tagline,
      credits,
      attendance_mode: attendance_mode,
      performer_type: performer_type,
      legacy_id: `csv-${id}`,
    };
  }

  static transformPriceRow(
    row: Record<string, string>,
  ): CreatePriceDto & { event_id: number } {
    const name = CSVFileParser.toLocalizedString(
      row.Name_NL,
      row.Name_EN,
      true,
      false,
    );
    const price = Number(row.Price);
    const eventId = Number(row.EventID);

    if (isNaN(price)) {
      throw new Error(`Invalid price: ${row.Price}`);
    }
    if (isNaN(eventId)) {
      throw new Error(`Invalid event id: ${row.EventID}`);
    }

    return {
      name,
      price,
      event_id: eventId,
    };
  }

  static transformBlogRow(
    row: Record<string, string>,
  ): CreateBlogDto & { production_id: number } {
    const titel = CSVFileParser.toLocalizedString(
      row.Titel_NL,
      row.Titel_EN,
      true,
      false,
    );
    const description = CSVFileParser.toLocalizedString(
      row.Description_NL,
      row.Description_EN,
      true,
      false,
    );
    const productionId = Number(row.ProductionID);
    if (isNaN(productionId)) {
      throw new Error(`Invalid production id: ${row.ProductionID}`);
    }

    return {
      titel,
      description,
      production_id: productionId,
    };
  }

  static transformTagRow(
    row: Record<string, string>,
  ): CreateTagDto & { productionIds: number[] } {
    const tag = CSVFileParser.toLocalizedString(
      row.TagName_NL,
      row.TagName_EN,
      true,
      false,
    );
    const productionIds = (row.ProductionIDs || "").split(",").map((id) => {
      const numId = Number(id.trim());
      if (isNaN(numId)) {
        throw new Error(`Invalid production id in ProductionIDs: ${id}`);
      }
      return numId;
    });

    return {
      tag,
      productionIds,
    };
  }

  /**
   * Parse events from a CSV file and return them along with their localized locations
   * @param filePath - Path to the CSV file containing events
   * @return A promise that resolves to an array of objects containing the event DTO and their localized locations
   */
  static async parseEventsCSV(
    input: CsvInputSource,
  ): Promise<ParsedLocalizedEventRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreateEventDto & {
        location: { en: string; nl: string };
        legacy_id: string;
      }
    >(
      input,
      CreateEventSchema.extend({
        location: z.object({ en: string(), nl: string() }),
        legacy_id: string(),
      }),
      this.transformEventRow,
    );

    return parsed.map((r) => {
      const { location, legacy_id, ...eventData } = r;
      return {
        event: eventData,
        location: location,
        legacy_id: legacy_id,
      };
    });
  }

  /**
   * Parse productions from a CSV file and return them along with their legacy IDs
   * @param filePath - Path to the CSV file containing productions
   * @return A promise that resolves to an array of objects containing the production DTO and their legacy IDs
   */
  static async parseProductionsCSV(
    input: CsvInputSource,
  ): Promise<ParsedProductionRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreateProductionDto & { legacy_id: string }
    >(
      input,
      CreateProductionSchema.extend({ legacy_id: string() }),
      this.transformProductionRow,
    );

    return parsed.map((r) => {
      const { legacy_id, ...productionData } = r;
      return {
        production: productionData,
        legacy_id: legacy_id,
      };
    });
  }

  /**
   * Parse prices from a CSV file and return them along with their associated event IDs
   * @param filePath - Path to the CSV file containing prices
   * @return A promise that resolves to an array of objects containing the price DTO and the associated event ID
   */
  static async parsePricesCSV(
    input: CsvInputSource,
  ): Promise<ParsedPriceRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreatePriceDto & { event_id: number }
    >(
      input,
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
  static async parseBlogsCSV(input: CsvInputSource): Promise<ParsedBlogRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreateBlogDto & { production_id: number }
    >(
      input,
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
  static async parseTagsCSV(input: CsvInputSource): Promise<ParsedTagRow[]> {
    const parsed = await this.parseCSVWithSchema<
      CreateTagDto & { productionIds: number[] }
    >(
      input,
      CreateTagSchema.extend({ productionIds: z.number().array() }),
      this.transformTagRow,
    );

    return parsed.map((r) => {
      const { productionIds, ...tagData } = r;
      return { tag: tagData, productionIds };
    });
  }
}
