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
      Hall: "Main Hall",
      Production: "5",
      Price: "25",
    };

    const result = CSVFileParser.transformEventRow(row);

    expect(result).toEqual({
      starttime: new Date("2024-01-01 10:00:00").toISOString(),
      endtime: new Date("2024-01-01 12:00:00").toISOString(),
      hall: "Main Hall",
      production_id: 5,
      price: 25,
    });
  });

  it("should set endtime to null if invalid", () => {
    const row = {
      Starttime: "2024-01-01 10:00:00",
      Endtime: "0000-00-00 00:00:00",
      Hall: "Main Hall",
      Production: "5",
      Price: "",
    };

    const result = CSVFileParser.transformEventRow(row);

    expect(result.endtime).toBeNull();
    expect(result.price).toBeNull();
  });

  it("should throw if starttime is invalid", () => {
    const row = {
      Starttime: "invalid-date",
      Endtime: "",
      Hall: "Main Hall",
      Production: "5",
      Price: "10",
    };

    expect(() => CSVFileParser.transformEventRow(row)).toThrow(
      "Invalid starttime",
    );
  });

  it("should throw if production id is invalid", () => {
    const row = {
      Starttime: "2024-01-01 10:00:00",
      Endtime: "",
      Hall: "Main Hall",
      Production: "abc",
      Price: "10",
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
      "Planning ID": "42",
    };

    const result = CSVFileParser.transformProductionRow(row);

    expect(result).toEqual({
      id: 1,
      titel: "Hamlet",
      ondertitel: "A tragedy",
      description1: "Main description",
      description2: null,
      planning_id: "42",
    });
  });

  it("should throw if ID is invalid", () => {
    const row = {
      ID: "notanumber",
      Titel: "Title",
      Ondertitel: "Sub",
      Description1: "desc",
      Description2: "",
      "Planning ID": "123",
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
    // include one valid and one invalid row
    mockedFs.createReadStream.mockReturnValue(
      createMockStream([
        {
          Starttime: "2025-05-01 14:00:00",
          Endtime: "2025-05-01 15:00:00",
          Hall: "Side Hall",
          Production: "10",
          Price: "20",
        },
        {
          // bad start time will be skipped by transform
          Starttime: "not-a-date",
          Endtime: "",
          Hall: "Side Hall",
          Production: "10",
          Price: "20",
        },
      ]) as any,
    );

    const events = await CSVFileParser.parseEventsCSV("events.csv");
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      starttime: new Date("2025-05-01 14:00:00").toISOString(),
      endtime: new Date("2025-05-01 15:00:00").toISOString(),
      hall: "Side Hall",
      production_id: 10,
      price: 20,
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
          "Planning ID": "5",
        },
      ]) as any,
    );

    const productions = await CSVFileParser.parseProductionsCSV("prods.csv");
    expect(productions).toEqual([
      {
        id: 2,
        titel: "Macbeth",
        ondertitel: "",
        description1: "desc",
        description2: "more",
        planning_id: "5",
      },
    ]);
  });
});

describe("CSVFileParser.insertEventsFromCSV", () => {
  const fakeService = { createEvent: jest.fn() } as any;

  afterEach(() => jest.clearAllMocks());

  it("should call eventService.createEvent for each parsed event", async () => {
    mockedFs.createReadStream.mockReturnValue(
      createMockStream([
        {
          Starttime: "2025-06-01 10:00:00",
          Endtime: "2025-06-01 11:00:00",
          Hall: "Hall A",
          Production: "1",
          Price: "15",
        },
      ]) as any,
    );

    fakeService.createEvent.mockResolvedValue({ id: 123 });
    const created = await CSVFileParser.insertEventsFromCSV(
      "file.csv",
      fakeService,
    );
    expect(fakeService.createEvent).toHaveBeenCalledTimes(1);
    expect(created).toEqual([{ id: 123 }]);
  });

  it("should propagate errors with contextual information", async () => {
    mockedFs.createReadStream.mockReturnValue(
      createMockStream([
        {
          Starttime: "2025-06-01 10:00:00",
          Endtime: "",
          Hall: "Hall B",
          Production: "2",
          Price: "0",
        },
      ]) as any,
    );

    fakeService.createEvent.mockRejectedValue(new Error("DB fail"));

    await expect(
      CSVFileParser.insertEventsFromCSV("file.csv", fakeService),
    ).rejects.toThrow(/Failed to insert event/);
  });
});
