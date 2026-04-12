import fs, { ReadStream } from "fs";
import { Readable } from "stream";
import { OldCSVFileParser } from "./old_csv_file_parser";

jest.mock("fs");

const mockedFs = fs as jest.Mocked<typeof fs>;

function createMockStream(rows: any[], error?: Error): ReadStream {
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
  } as unknown as ReadStream;
}

describe("OldCSVFileParser", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("OldCSVFileParser.transformOldEventRow", () => {
    it("should transform a valid row correctly", () => {
      const row = {
        Starttime: "2024-01-01 10:00:00",
        Endtime: "2024-01-01 12:00:00",
        Production: "5",
        Genre: "drama",
        Hall: "Main Hall",
      };

      const result = OldCSVFileParser.transformOldEventRow(row);

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

      const result = OldCSVFileParser.transformOldEventRow(row);

      expect(result.endtime).toBeNull();
      expect(result.location).toBe("");
    });

    it("should throw if starttime is invalid", () => {
      const row = {
        Starttime: "invalid-date",
        Endtime: "",
        Production: "5",
      };

      expect(() => OldCSVFileParser.transformOldEventRow(row)).toThrow(
        "Invalid starttime",
      );
    });

    it("should throw if production id is invalid", () => {
      const row = {
        Starttime: "2024-01-01 10:00:00",
        Endtime: "",
        Production: "abc",
      };

      expect(() => OldCSVFileParser.transformOldEventRow(row)).toThrow(
        "Invalid production id",
      );
    });
  });

  describe("OldCSVFileParser.transformOldProductionRow", () => {
    it("should transform production row correctly", () => {
      const row = {
        ID: "1",
        Titel: "Hamlet",
        Ondertitel: "A tragedy",
        Description1: "Main description",
        Description2: "",
        Genre: "drama",
      };

      const result = OldCSVFileParser.transformOldProductionRow(row);

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
      expect(() => OldCSVFileParser.transformOldProductionRow(row)).toThrow(
        /Invalid production id/,
      );
    });
  });

  describe("OldCSVFileParser.parseOldEventsCSV", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("should parse and transform event rows, skipping invalid ones", async () => {
      mockedFs.createReadStream.mockReturnValue(
        createMockStream([
          {
            Starttime: "2025-05-01 14:00:00",
            Endtime: "2025-05-01 15:00:00",
            Production: "10",
            Hall: "Front Stage",
          },
          {
            Starttime: "not-a-date",
            Endtime: "",
            Production: "10",
            Hall: "Backstage",
          },
        ]),
      );

      const items = await OldCSVFileParser.parseOldEventsCSV("events.csv");
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

  describe("OldCSVFileParser.parseOldProductionsCSV", () => {
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
        ]),
      );
      const result = await OldCSVFileParser.parseOldProductionsCSV("prods.csv");

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
