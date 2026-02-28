import fs from "fs";
import csvParser from "csv-parser";
import { ZodType } from "zod";
import { CreateEventDto, ProductionDto } from "../../backend/src/dto/dto";
import { CreateEventSchema, ProductionSchema } from "./database_objects";

export class CSVParser {
  /**
   * Parse a CSV file and return the data as an array of objects
   * @param filePath - Path to the CSV file
   * @param schema - Zod schema to validate the parsed data
   * @param transform - Function to transform each row of the CSV into the desired format
   * @returns A promise that resolves to an array of parsed and validated objects
   */
  static async parseCSVWithSchema<T>(
    filePath: string,
    schema: ZodType<T>,
    transform: (row: Record<string, string>) => T,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];

      fs.createReadStream(filePath)
        .pipe(
          csvParser({
            strict: true, // Enable strict mode to catch parsing errors
            mapHeaders: ({ header }) => header.trim(), // Trim whitespace from headers
            mapValues: ({ value }) => value.trim(), // Trim whitespace from values
          }),
        )
        .on("data", (row: Record<string, string>) => {
          try {
            // apply the transformation function to the row and validate it against the schema
            const transformedRow: T = transform(row);
            // try to parse the transformed row with the schema, if it fails, catch the error and reject the promise
            const validationResult: T = schema.parse(transformedRow);
            results.push(validationResult);
          } catch (error) {
            reject(`Error parsing row: ${JSON.stringify(row)} - ${error}`);
          }
        })
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(`Error reading CSV file: ${error}`);
        });
    });
  }

  static transformEventRow(row: Record<string, string>): CreateEventDto {
    let endTime: string | null = null;

    // Check for invalid date formats and handle them accordingly
    const invalidDates = ["0000-00-00 00:00:00", "1970-01-01 00:00:00", ""];
    const starttimeDate = new Date(row.Starttime);
    if (row.Endtime && !invalidDates.includes(row.Endtime)) {
      const endTimeDate = new Date(row.Endtime);
      if (!isNaN(endTimeDate.getTime()) && endTimeDate > starttimeDate)
        endTime = endTimeDate.toISOString();
    }

    return {
      starttime: starttimeDate.toISOString(),
      endtime: endTime,
      hall: row.Hall,
      production_id: Number(row.Production),
      price: row.Price ? Number(row.Price) : null,
    };
  }

  static transformProductionRow(row: Record<string, string>) {
    return {
      id: Number(row.ID),
      titel: row.Titel,
      ondertitel: row.Ondertitel,
      description1: row.Description1,
      description2: row.Description2 || null,
      //TODO: remove this and add as tag instead
      genre: row.Genre,
      //TODO: change to string when bug is fixed
      planning_id: row["Planning ID"] ? Number(row["Planning ID"]) : null,
    };
  }

  static parseEventsCSV(filePath: string): Promise<CreateEventDto[]> {
    return this.parseCSVWithSchema<CreateEventDto>(
      filePath,
      CreateEventSchema,
      this.transformEventRow,
    );
  }

  static parseProductionsCSV(filePath: string): Promise<ProductionDto[]> {
    return this.parseCSVWithSchema<ProductionDto>(
      filePath,
      ProductionSchema,
      this.transformProductionRow,
    );
  }

}
