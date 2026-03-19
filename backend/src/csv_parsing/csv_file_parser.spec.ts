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

// TODO: Remove skip
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
});
