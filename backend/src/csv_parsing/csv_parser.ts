import fs from "fs";
import csvParser from "csv-parser";
import { ZodType } from "zod";
import { CreateEventDto, ProductionDto } from "../dto/dto";
import {
  CreateEventSchema,
  ProductionSchema,
} from "@repo/common/src/database_objects";
import { EventService } from "../event/event.service";

export class CSVParser {
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

  static transformEventRow(row: Record<string, string>): CreateEventDto {
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

    return {
      starttime: starttimeDate.toISOString(),
      endtime: endTime,
      hall: row.Hall,
      production_id: productionId,
      price: row.Price ? Number(row.Price) : null,
    };
  }

  static transformProductionRow(row: Record<string, string>) {
    // validate and convert numeric fields manually to provide clearer errors
    const id = Number(row.ID);
    if (isNaN(id)) {
      throw new Error(`Invalid production id: ${row.ID}`);
    }

    const planningId = row["Planning ID"] || null;

    return {
      id,
      titel: row.Titel,
      ondertitel: row.Ondertitel,
      description1: row.Description1,
      description2: row.Description2 || null,
      //TODO: remove this and add as tag instead
      genre: row.Genre,
      planning_id: planningId,
    };
  }

  /**
   * Parse events from a CSV file and return them as an array of CreateEventDto objects
   * @param filePath - Path to the CSV file containing events
   * @return A promise that resolves to an array of CreateEventDto objects
   * @throws An error if the file cannot be read or if any row fails validation
   */
  static parseEventsCSV(filePath: string): Promise<CreateEventDto[]> {
    return this.parseCSVWithSchema<CreateEventDto>(
      filePath,
      CreateEventSchema,
      this.transformEventRow,
    );
  }

  /**
   * Parse productions from a CSV file and return them as an array of ProductionDto objects
   * @param filePath - Path to the CSV file containing productions
   * @return A promise that resolves to an array of ProductionDto objects
   */
  static parseProductionsCSV(filePath: string): Promise<ProductionDto[]> {
    return this.parseCSVWithSchema<ProductionDto>(
      filePath,
      ProductionSchema,
      this.transformProductionRow,
    );
  }

  /**
   * Parse events from a CSV file and insert them into the database.
   * @param filePath - Path to the CSV file containing events
   * @param eventService - Instance of EventService to insert events into the database
   * @returns A promise that resolves to an array of created EventDto objects
   */
  static async insertEventsFromCSV(
    filePath: string,
    eventService: EventService,
  ) {
    const events = await this.parseEventsCSV(filePath);
    const createdEvents = [];

    for (const event of events) {
      try {
        const createdEvent = await eventService.createEvent(event);
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

  //TODO: add inserting function for productions once new insert endpoint is added to backend
}
