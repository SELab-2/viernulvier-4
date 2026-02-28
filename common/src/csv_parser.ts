import fs from "fs";
import csvParser from "csv-parser";
import { ZodSchema } from "zod";
import { CreateEventDto } from "../../backend/src/dto/dto";

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
    schema: ZodSchema<T>,
    transform: (row: Record<string, string>) => T,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];

      fs.createReadStream(filePath)
        .pipe(
          csvParser({
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
    if (row.EndTime && !invalidDates.includes(row.EndTime)) {
      const endTimeDate = new Date(row.EndTime);
      if (!isNaN(endTimeDate.getTime()) && endTimeDate > starttimeDate)
        endTime = endTimeDate.toISOString();
    }

    const productionId = Number(row.Production);
    if (isNaN(productionId))
      throw new Error(`Invalid production_id: ${row.Production}`);

    return {
      starttime: starttimeDate.toISOString(),
      endtime: endTime,
      hall: row.Hall,
      production_id: productionId,
      price: row.Price ? Number(row.Price) : null,
    };
  }
}
