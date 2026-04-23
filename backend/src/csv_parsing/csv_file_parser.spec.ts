import fs, { ReadStream } from "fs";
import { Readable } from "stream";
import { z } from "zod";
import { CSVFileParser } from "./csv_file_parser";

jest.mock("fs");

const mockedFs = fs as jest.Mocked<typeof fs>;

function createMockReadStream(rows: any[], error?: Error): ReadStream {
  const sourceStream = new Readable({
    read() {},
  });

  const parsedStream = new Readable({
    objectMode: true,
    read() {},
  });

  // Mock the pipe method to return the parsed stream
  sourceStream.pipe = jest.fn().mockReturnValue(parsedStream);

  process.nextTick(() => {
    if (error) {
      parsedStream.emit("error", error);
      return;
    }

    rows.forEach((row) => parsedStream.emit("data", row));
    parsedStream.emit("end");
  });

  return sourceStream as unknown as ReadStream;
}

describe("CSVFileParser", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("CSVFileParser.parseCSVWithSchema", () => {
    beforeEach(() => {
      // silence warnings emitted during parsing; tests will assert on them if needed
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("should parse valid rows", async () => {
      mockedFs.createReadStream.mockReturnValue(
        createMockReadStream([
          { name: "John", age: "30" },
          { name: "Jane", age: "25" },
        ]),
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

    it("should parse valid rows from an in-memory Buffer", async () => {
      const csvBuffer = Buffer.from("name,age\nJohn,30\nJane,25\n", "utf8");

      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = await CSVFileParser.parseCSVWithSchema(
        csvBuffer,
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
      expect(mockedFs.createReadStream).not.toHaveBeenCalled();
    });

    it("should reject when stream emits error", async () => {
      mockedFs.createReadStream.mockReturnValue(
        createMockReadStream([], new Error("Stream failure")),
      );

      await expect(
        CSVFileParser.parseCSVWithSchema("dummy.csv", z.any(), (row) => row),
      ).rejects.toThrow("Stream failure");
    });
  });

  describe("CSVFileParser.transformEventRow", () => {
    it("should transform a valid new format event row correctly", () => {
      const row = {
        ID: "42",
        Starttime: "2024-03-15 19:00:00",
        Endtime: "2024-03-15 21:00:00",
        Production: "7",
        Location_NL: "Grote Zaal",
        Location_EN: "Main Hall",
        Doors_At: "2024-03-15 18:30:00",
        Intermission_At: "2024-03-15 20:00:00",
      };

      const result = CSVFileParser.transformEventRow(row);

      expect(result).toEqual({
        starttime: new Date("2024-03-15 19:00:00").toISOString(),
        endtime: new Date("2024-03-15 21:00:00").toISOString(),
        production_id: 7,
        location: { en: "Main Hall", nl: "Grote Zaal" },
        doors_at: new Date("2024-03-15 18:30:00").toISOString(),
        intermission_at: new Date("2024-03-15 20:00:00").toISOString(),
        legacy_id: "csv-42",
      });
    });

    it("should set endtime to null for invalid or empty endtime", () => {
      const row = {
        ID: "1",
        Starttime: "2024-01-01 10:00:00",
        Endtime: "0000-00-00 00:00:00",
        Production: "5",
        Location_NL: "",
        Location_EN: "",
        Doors_At: "",
        Intermission_At: "",
      };

      const result = CSVFileParser.transformEventRow(row);

      expect(result.endtime).toBeNull();
    });

    it("should throw if ID is invalid", () => {
      const row = {
        ID: "invalid",
        Starttime: "2024-01-01 10:00:00",
        Endtime: "",
        Production: "5",
        Location_NL: "",
        Location_EN: "",
      };

      expect(() => CSVFileParser.transformEventRow(row)).toThrow(
        "Invalid production id",
      );
    });
  });

  describe("CSVFileParser.transformProductionRow", () => {
    it("should transform a valid new format production row correctly", () => {
      const row = {
        ID: "10",
        Titel_NL: "Hamlet",
        Titel_EN: "Hamlet",
        Description1_NL: "Een tragedie",
        Description1_EN: "A tragedy",
        Description2_NL: "Meer details",
        Description2_EN: "More details",
        Artist_NL: "Shakespeare",
        Artist_EN: "Shakespeare",
        Tagline_NL: "Ondertitel",
        Tagline_EN: "Subtitle",
        Credits_NL: "Regisseur",
        Credits_EN: "Director",
        Performer_Type: "actors",
        Attendance_Mode: "online",
      };

      const result = CSVFileParser.transformProductionRow(row);

      expect(result).toEqual({
        titel: { en: "Hamlet", nl: "Hamlet" },
        description1: { en: "A tragedy", nl: "Een tragedie" },
        description2: { en: "More details", nl: "Meer details" },
        artist: { en: "Shakespeare", nl: "Shakespeare" },
        tagline: { en: "Subtitle", nl: "Ondertitel" },
        credits: { en: "Director", nl: "Regisseur" },
        attendance_mode: "online",
        performer_type: "actors",
        legacy_id: "csv-10",
      });
    });

    it("should handle missing optional fields as null", () => {
      const row = {
        ID: "5",
        Titel_NL: "Title",
        Titel_EN: "Title",
        Description1_NL: "Description",
        Description1_EN: "Description",
        Description2_NL: "",
        Description2_EN: "",
        Artist_NL: "",
        Artist_EN: "",
        Tagline_NL: "",
        Tagline_EN: "",
        Credits_NL: "",
        Credits_EN: "",
        Performer_Type: "",
        Attendance_Mode: "",
      };

      const result = CSVFileParser.transformProductionRow(row);

      expect(result.description2).toBeNull();
      expect(result.artist).toBeNull();
      expect(result.tagline).toBeNull();
      expect(result.credits).toBeNull();
      expect(result.performer_type).toBeNull();
      expect(result.attendance_mode).toBeNull();
    });

    it("should throw if ID is invalid", () => {
      const row = {
        ID: "not-a-number",
        Titel_NL: "Title",
        Titel_EN: "Title",
        Description1_NL: "Desc",
        Description1_EN: "Desc",
        Description2_NL: "",
        Description2_EN: "",
        Artist_NL: "",
        Artist_EN: "",
        Tagline_NL: "",
        Tagline_EN: "",
        Credits_NL: "",
        Credits_EN: "",
        Performer_Type: "",
        Attendance_Mode: "",
      };

      expect(() => CSVFileParser.transformProductionRow(row)).toThrow(
        "Invalid production id",
      );
    });

    it("should throw if required Titel_NL is missing", () => {
      const row = {
        ID: "1",
        Titel_NL: "",
        Titel_EN: "Title",
        Description1_NL: "",
        Description1_EN: "Desc",
        Description2_NL: "",
        Description2_EN: "",
        Artist_NL: "",
        Artist_EN: "",
        Tagline_NL: "",
        Tagline_EN: "",
        Credits_NL: "",
        Credits_EN: "",
        Performer_Type: "",
        Attendance_Mode: "",
      };

      expect(() => CSVFileParser.transformProductionRow(row)).toThrow(
        "Required Dutch value is missing",
      );
    });
  });

  describe("CSVFileParser.transformPriceRow", () => {
    it("should transform a valid price row correctly", () => {
      const row = {
        Name_NL: "Volwassenen",
        Name_EN: "Adults",
        Price: "25.50",
        EventID: "1",
      };

      const result = CSVFileParser.transformPriceRow(row);

      expect(result).toEqual({
        name: { en: "Adults", nl: "Volwassenen" },
        price: 25.5,
        event_id: 1,
      });
    });

    it("should throw if price is invalid", () => {
      const row = {
        Name_NL: "Price",
        Name_EN: "Price",
        Price: "invalid",
        EventID: "1",
      };

      expect(() => CSVFileParser.transformPriceRow(row)).toThrow(
        "Invalid price",
      );
    });

    it("should throw if event id is invalid", () => {
      const row = {
        Name_NL: "Price",
        Name_EN: "Price",
        Price: "20",
        EventID: "not-an-id",
      };

      expect(() => CSVFileParser.transformPriceRow(row)).toThrow(
        "Invalid event id",
      );
    });

    it("should throw if Name_NL is missing", () => {
      const row = {
        Name_NL: "",
        Name_EN: "Price",
        Price: "20",
        EventID: "1",
      };

      expect(() => CSVFileParser.transformPriceRow(row)).toThrow(
        "Required Dutch value is missing",
      );
    });
  });

  describe("CSVFileParser.transformBlogRow", () => {
    it("should transform a valid blog row correctly", () => {
      const row = {
        Titel_NL: "Blog Post",
        Titel_EN: "Blog Post",
        Description_NL: "Beschrijving",
        Description_EN: "Description",
        ProductionID: "5",
      };

      const result = CSVFileParser.transformBlogRow(row);

      expect(result).toEqual({
        titel: { en: "Blog Post", nl: "Blog Post" },
        description: { en: "Description", nl: "Beschrijving" },
        production_id: 5,
      });
    });

    it("should throw if ProductionID is invalid", () => {
      const row = {
        Titel_NL: "Title",
        Titel_EN: "Title",
        Description_NL: "Desc",
        Description_EN: "Desc",
        ProductionID: "abc",
      };

      expect(() => CSVFileParser.transformBlogRow(row)).toThrow(
        "Invalid production id",
      );
    });

    it("should throw if Titel_NL is required and missing", () => {
      const row = {
        Titel_NL: "",
        Titel_EN: "Title",
        Description_NL: "",
        Description_EN: "Desc",
        ProductionID: "1",
      };

      expect(() => CSVFileParser.transformBlogRow(row)).toThrow(
        "Required Dutch value is missing",
      );
    });
  });

  describe("CSVFileParser.transformTagRow", () => {
    it("should transform a valid tag row correctly", () => {
      const row = {
        TagName_NL: "Drama",
        TagName_EN: "Drama",
        ProductionIDs: "1,2,3",
      };

      const result = CSVFileParser.transformTagRow(row);

      expect(result).toEqual({
        tag: { en: "Drama", nl: "Drama" },
        productionIds: [1, 2, 3],
      });
    });

    it("should handle single production ID", () => {
      const row = {
        TagName_NL: "Comedy",
        TagName_EN: "Comedy",
        ProductionIDs: "10",
      };

      const result = CSVFileParser.transformTagRow(row);

      expect(result.productionIds).toEqual([10]);
    });

    it("should handle empty ProductionIDs with single zero element", () => {
      const row = {
        TagName_NL: "Tag",
        TagName_EN: "Tag",
        ProductionIDs: "",
      };

      const result = CSVFileParser.transformTagRow(row);

      // Empty string split gives [""], which converts to [0]
      expect(result.productionIds).toEqual([0]);
    });

    it("should throw if a production ID is invalid", () => {
      const row = {
        TagName_NL: "Tag",
        TagName_EN: "Tag",
        ProductionIDs: "1,invalid,3",
      };

      expect(() => CSVFileParser.transformTagRow(row)).toThrow(
        "Invalid production id in ProductionIDs",
      );
    });
  });

  describe("CSVFileParser.parseEventsCSV", () => {
    it("should extract location and legacy_id from parsed events", async () => {
      jest.spyOn(CSVFileParser, "parseCSVWithSchema" as any).mockResolvedValue([
        {
          starttime: "2025-05-01T14:00:00.000Z",
          endtime: "2025-05-01T16:00:00.000Z",
          production_id: 10,
          location: { en: "Hall A", nl: "Zaal A" },
          legacy_id: "csv-1",
          doors_at: null,
          intermission_at: null,
        },
      ]);

      const result = await CSVFileParser.parseEventsCSV("events.csv");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        event: {
          starttime: "2025-05-01T14:00:00.000Z",
          endtime: "2025-05-01T16:00:00.000Z",
          production_id: 10,
          doors_at: null,
          intermission_at: null,
        },
        location: { en: "Hall A", nl: "Zaal A" },
        legacy_id: "csv-1",
      });
    });
  });

  describe("CSVFileParser.parseProductionsCSV", () => {
    it("should extract production data and legacy_id", async () => {
      jest.spyOn(CSVFileParser, "parseCSVWithSchema" as any).mockResolvedValue([
        {
          titel: { en: "Macbeth", nl: "Macbeth" },
          description1: { en: "Tragedy", nl: "Tragedy" },
          description2: null,
          artist: null,
          tagline: null,
          credits: null,
          attendance_mode: "live",
          performer_type: "actors",
          legacy_id: "csv-5",
        },
      ]);

      const result = await CSVFileParser.parseProductionsCSV("prods.csv");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        production: {
          titel: { en: "Macbeth", nl: "Macbeth" },
          description1: { en: "Tragedy", nl: "Tragedy" },
          description2: null,
          artist: null,
          tagline: null,
          credits: null,
          attendance_mode: "live",
          performer_type: "actors",
        },
        legacy_id: "csv-5",
      });
    });
  });

  describe("CSVFileParser.parsePricesCSV", () => {
    it("should extract price data and event_id", async () => {
      jest.spyOn(CSVFileParser, "parseCSVWithSchema" as any).mockResolvedValue([
        {
          name: { en: "Adults", nl: "Volwassenen" },
          price: 35,
          event_id: 1,
        },
        {
          name: { en: "Children", nl: "Kinderen" },
          price: 20,
          event_id: 1,
        },
      ]);

      const result = await CSVFileParser.parsePricesCSV("prices.csv");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        price: { name: { en: "Adults", nl: "Volwassenen" }, price: 35 },
        event_id: 1,
      });
      expect(result[1]).toEqual({
        price: { name: { en: "Children", nl: "Kinderen" }, price: 20 },
        event_id: 1,
      });
    });
  });

  describe("CSVFileParser.parseBlogsCSV", () => {
    it("should extract blog data and production_id", async () => {
      jest.spyOn(CSVFileParser, "parseCSVWithSchema" as any).mockResolvedValue([
        {
          titel: { en: "Review", nl: "Review" },
          description: { en: "A good review", nl: "Een goede review" },
          production_id: 3,
        },
      ]);

      const result = await CSVFileParser.parseBlogsCSV("blogs.csv");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        blog: {
          titel: { en: "Review", nl: "Review" },
          description: { en: "A good review", nl: "Een goede review" },
        },
        production_id: 3,
      });
    });
  });

  describe("CSVFileParser.parseTagsCSV", () => {
    it("should extract tag data and production IDs", async () => {
      jest.spyOn(CSVFileParser, "parseCSVWithSchema" as any).mockResolvedValue([
        {
          tag: { en: "Drama", nl: "Drama" },
          productionIds: [1, 2],
        },
        {
          tag: { en: "Comedy", nl: "Komedie" },
          productionIds: [3],
        },
      ]);

      const result = await CSVFileParser.parseTagsCSV("tags.csv");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        tag: { tag: { en: "Drama", nl: "Drama" } },
        productionIds: [1, 2],
      });
      expect(result[1]).toEqual({
        tag: { tag: { en: "Comedy", nl: "Komedie" } },
        productionIds: [3],
      });
    });
  });
});
