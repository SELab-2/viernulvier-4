import { string } from "zod";
import { CreateEventDto, CreateProductionDto } from "../dto/dto";
import { CreateEventSchema, CreateProductionSchema } from "@repo/common";
import { CSVFileParser } from "./csv_file_parser";

/**
 * Type used to structure production import.
 */
type ParsedProductionImport = {
  productions: (CreateProductionDto & { legacy_id: string })[];
  tags: string[];
  productionTagLinks: { legacyId: string; tagName: string }[];
};

/**
 * Internal helper used when parsing old events.
 */
type ParsedEventRow = {
  event: CreateEventDto;
  location: string;
};

export class OldCSVFileParser {
  private static toOldLocalizedString(value: string): {
    en: string;
    nl: string;
  } {
    const normalized = (value || "").trim();
    return {
      en: normalized,
      nl: normalized,
    };
  }

  static transformOldEventRow(
    row: Record<string, string>,
  ): CreateEventDto & { location: string } {
    let endTime: string | null = null;

    // Check for invalid date formats and handle them accordingly.
    const invalidDates = ["0000-00-00 00:00:00", "1970-01-01 00:00:00", ""];
    const starttimeDate = new Date(row.Starttime);
    if (isNaN(starttimeDate.getTime())) {
      throw new Error(`Invalid starttime: ${row.Starttime}`);
    }
    if (row.Endtime && !invalidDates.includes(row.Endtime)) {
      const endTimeDate = new Date(row.Endtime);
      if (!isNaN(endTimeDate.getTime()) && endTimeDate > starttimeDate) {
        endTime = endTimeDate.toISOString();
      }
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
      location,
      doors_at: null,
      intermission_at: null,
    };
  }

  static transformOldProductionRow(
    row: Record<string, string>,
  ): CreateProductionDto & { tags: string[]; legacy_id: string } {
    // Validate and convert numeric fields manually to provide clearer errors.
    const id = Number(row.ID);
    if (isNaN(id)) {
      throw new Error(`Invalid production id: ${row.ID}`);
    }

    // Parse comma separated tags, trim whitespace and normalize casing.
    const tags = (row.Genre || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const tagLine = row.Tagline || row.Ondertitel || null;

    const legacy_id = `csv-${id}`;

    return {
      titel: OldCSVFileParser.toOldLocalizedString(row.Titel),
      description1: OldCSVFileParser.toOldLocalizedString(row.Description1),
      description2: row.Description2
        ? OldCSVFileParser.toOldLocalizedString(row.Description2)
        : null,
      artist: null,
      tagline: tagLine ? OldCSVFileParser.toOldLocalizedString(tagLine) : null,
      credits: null,
      attendance_mode: null,
      performer_type: null,
      legacy_id,
      tags: [...new Set(tags)], // Remove duplicate tags.
    };
  }

  /**
   * Parse events from an old CSV file and return them along with a raw location.
   */
  static async parseOldEventsCSV(filePath: string): Promise<ParsedEventRow[]> {
    const parsed = await CSVFileParser.parseCSVWithSchema<
      CreateEventDto & { location: string }
    >(filePath, CreateEventSchema.extend({ location: string() }), (row) =>
      OldCSVFileParser.transformOldEventRow(row),
    );

    return parsed.map((r) => {
      const { location, ...eventData } = r;
      return { event: eventData, location };
    });
  }

  /**
   * Parse productions from an old CSV file and return structured import data.
   */
  static async parseOldProductionsCSV(
    filePath: string,
  ): Promise<ParsedProductionImport> {
    const productions: (CreateProductionDto & { legacy_id: string })[] = [];
    const tagsSet: Set<string> = new Set();
    const productionTagLinks: { legacyId: string; tagName: string }[] = [];

    const parsed = await CSVFileParser.parseCSVWithSchema<
      CreateProductionDto & { tags: string[]; legacy_id: string }
    >(
      filePath,
      CreateProductionSchema.extend({
        tags: string().array(),
        legacy_id: string(),
      }),
      (row) => OldCSVFileParser.transformOldProductionRow(row),
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
      productions,
      tags: Array.from(tagsSet),
      productionTagLinks,
    };
  }
}
