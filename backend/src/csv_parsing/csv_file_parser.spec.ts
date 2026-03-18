import fs from "fs";
import { Readable } from "stream";
import { z } from "zod";
import { CSVFileParser } from "./csv_file_parser";

jest.mock("fs");

const mockedFs = fs as jest.Mocked<typeof fs>;

function createMockStream(rows: any[], error?: Error) {
  const stream = new Readable({
    objectMode: true,
    read() {},
  });

  process.nextTick(() => {
    if (error) {
      stream.emit("error", error);
      return;
    }

    rows.forEach((row) => stream.emit("data", row));
    stream.emit("end");
  });

  return {
    pipe: jest.fn().mockReturnValue(stream),
  };
}

describe("CSVFileParser", () => {
  describe("CSVFileParser.parseCSVWithSchema", () => {
    beforeEach(() => {
      // silence warnings emitted during parsing; tests will assert on them if needed
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it("should parse valid rows", async () => {
      mockedFs.createReadStream.mockReturnValue(
        createMockStream([
          { name: "John", age: "30" },
          { name: "Jane", age: "25" },
        ]) as any,
      );

      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = await CSVFileParser.parseCSVWithSchema(
        "dummy.csv",
        schema,
        (row) => ({
          name: row.name,
          age: Number(row.age),
        }),
      );

      expect(result).toEqual([
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ]);
    });

    it("should reject when stream emits error", async () => {
      mockedFs.createReadStream.mockReturnValue(
        createMockStream([], new Error("Stream failure")) as any,
      );

      await expect(
        CSVFileParser.parseCSVWithSchema("dummy.csv", z.any(), (row) => row),
      ).rejects.toThrow("Stream failure");
    });
  });

  describe("CSVFileParser.transformEventRow", () => {
    it("should transform a valid row correctly", () => {
      const row = {
        Starttime: "2024-01-01 10:00:00",
        Endtime: "2024-01-01 12:00:00",
        Production: "5",
        Genre: "drama",
        Hall: "Main Hall",
      };

      const result = CSVFileParser.transformEventRow(row);

      expect(result).toEqual({
        starttime: new Date("2024-01-01 10:00:00").toISOString(),
        endtime: new Date("2024-01-01 12:00:00").toISOString(),
        production_id: 5,
        location: "Main Hall",
        doors_at: null,
        intermission_at: null,
      });
    });

    it("should set endtime to null if invalid", () => {
      const row = {
        Starttime: "2024-01-01 10:00:00",
        Endtime: "0000-00-00 00:00:00",
        Production: "5",
        Hall: "",
      };

      const result = CSVFileParser.transformEventRow(row);

      expect(result.endtime).toBeNull();
      expect(result.location).toBe("");
    });

    it("should throw if starttime is invalid", () => {
      const row = {
        Starttime: "invalid-date",
        Endtime: "",
        Production: "5",
      };

      expect(() => CSVFileParser.transformEventRow(row)).toThrow(
        "Invalid starttime",
      );
    });

    it("should throw if production id is invalid", () => {
      const row = {
        Starttime: "2024-01-01 10:00:00",
        Endtime: "",
        Production: "abc",
      };

      expect(() => CSVFileParser.transformEventRow(row)).toThrow(
        "Invalid production id",
      );
    });
  });

  describe("CSVFileParser.transformProductionRow", () => {
    it("should transform production row correctly", () => {
      const row = {
        ID: "1",
        Titel: "Hamlet",
        Ondertitel: "A tragedy",
        Description1: "Main description",
        Description2: "",
        Genre: "drama",
      };

      const result = CSVFileParser.transformProductionRow(row);

      expect(result).toEqual({
        titel: { en: "Hamlet", nl: "Hamlet" },
        description1: { en: "Main description", nl: "Main description" },
        description2: null,
        tags: ["drama"],
        artist: null,
        tagline: { en: "A tragedy", nl: "A tragedy" },
        credits: null,
        performer_type: null,
        attendance_mode: null,
        legacy_id: "csv-1",
      });
    });

    it("should throw if ID is invalid", () => {
      const row = {
        ID: "notanumber",
        Titel: "Title",
        Ondertitel: "Sub",
        Description1: "desc",
        Description2: "",
      };
      expect(() => CSVFileParser.transformProductionRow(row)).toThrow(
        /Invalid production id/,
      );
    });
  });

  // additional tests for the convenience wrappers and insertion logic

  describe("CSVFileParser.parseEventsCSV", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => jest.clearAllMocks());

    it("should parse and transform event rows, skipping invalid ones", async () => {
      // include one valid and one invalid row; valid row contains a hall
      mockedFs.createReadStream.mockReturnValue(
        createMockStream([
          {
            Starttime: "2025-05-01 14:00:00",
            Endtime: "2025-05-01 15:00:00",
            Production: "10",
            Hall: "Front Stage",
          },
          {
            // bad start time will be skipped by transform
            Starttime: "not-a-date",
            Endtime: "",
            Production: "10",
            Hall: "Backstage",
          },
        ]) as any,
      );

      const items = await CSVFileParser.parseEventsCSV("events.csv");
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        event: {
          starttime: new Date("2025-05-01 14:00:00").toISOString(),
          endtime: new Date("2025-05-01 15:00:00").toISOString(),
          production_id: 10,
          doors_at: null,
          intermission_at: null,
        },
        location: "Front Stage",
      });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Skipping invalid row"),
      );
    });
  });

  describe("CSVFileParser.parseProductionsCSV", () => {
    afterEach(() => jest.clearAllMocks());

    it("should parse production rows and validate against schema", async () => {
      mockedFs.createReadStream.mockReturnValue(
        createMockStream([
          {
            ID: "2",
            Titel: "Macbeth",
            Ondertitel: "",
            Description1: "desc",
            Description2: "more",
            Genre: "tragedy",
          },
        ]) as any,
      );
      const result = await CSVFileParser.parseProductionsCSV("prods.csv");
      // since we only provided one row without any comma-separated genres,
      // we expect a single production, no tags, and no links
      expect(result).toEqual({
        productions: [
          {
            titel: { en: "Macbeth", nl: "Macbeth" },
            tagline: null,
            description1: { en: "desc", nl: "desc" },
            description2: { en: "more", nl: "more" },
            artist: null,
            credits: null,
            performer_type: null,
            attendance_mode: null,
            legacy_id: "csv-2",
          },
        ],
        tags: ["tragedy"],
        productionTagLinks: [{ legacyId: "csv-2", tagName: "tragedy" }],
      });
    });
  });
});
