import fs from "fs";
import { Readable } from "stream";
import { z } from "zod";
import { CSVParser } from "./csv_parser";


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

describe("CSVParser.parseCSVWithSchema", () => {
  afterEach(() => {
    jest.clearAllMocks();
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

    const result = await CSVParser.parseCSVWithSchema(
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
      CSVParser.parseCSVWithSchema("dummy.csv", z.any(), (row) => row),
    ).rejects.toThrow("Stream failure");
  });
});

describe("CSVParser.transformEventRow", () => {
  it("should transform a valid row correctly", () => {
    const row = {
      Starttime: "2024-01-01 10:00:00",
      Endtime: "2024-01-01 12:00:00",
      Hall: "Main Hall",
      Production: "5",
      Price: "25",
    };

    const result = CSVParser.transformEventRow(row);

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

    const result = CSVParser.transformEventRow(row);

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

    expect(() => CSVParser.transformEventRow(row)).toThrow("Invalid starttime");
  });

  it("should throw if production id is invalid", () => {
    const row = {
      Starttime: "2024-01-01 10:00:00",
      Endtime: "",
      Hall: "Main Hall",
      Production: "abc",
      Price: "10",
    };

    expect(() => CSVParser.transformEventRow(row)).toThrow(
      "Invalid production id",
    );
  });
});

describe("CSVParser.transformProductionRow", () => {
  it("should transform production row correctly", () => {
    const row = {
      ID: "1",
      Titel: "Hamlet",
      Ondertitel: "A tragedy",
      Description1: "Main description",
      Description2: "",
      Genre: "Drama",
      "Planning ID": "42",
    };

    const result = CSVParser.transformProductionRow(row);

    expect(result).toEqual({
      id: 1,
      titel: "Hamlet",
      ondertitel: "A tragedy",
      description1: "Main description",
      description2: null,
      genre: "Drama",
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
      Genre: "Comedy",
      "Planning ID": "123",
    };
    expect(() => CSVParser.transformProductionRow(row)).toThrow(
      /Invalid production id/,
    );
  });
});
