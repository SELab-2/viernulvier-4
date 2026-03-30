import { InjectCsvEngine } from "./inject-csv.engine";

const mockParseProductionsCSV = jest.fn();
const mockParseEventsCSV = jest.fn();
const mockParseTagsCSV = jest.fn();
const mockParseBlogsCSV = jest.fn();
const mockParsePricesCSV = jest.fn();

jest.mock("../../../csv_parsing/csv_file_parser", () => ({
  CSVFileParser: {
    parseProductionsCSV: (...args: unknown[]) =>
      mockParseProductionsCSV(...args),
    parseEventsCSV: (...args: unknown[]) => mockParseEventsCSV(...args),
    parseTagsCSV: (...args: unknown[]) => mockParseTagsCSV(...args),
    parseBlogsCSV: (...args: unknown[]) => mockParseBlogsCSV(...args),
    parsePricesCSV: (...args: unknown[]) => mockParsePricesCSV(...args),
  },
}));

// We still mock the global logger since it is imported directly in the file
jest.mock("../../logger/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("inject-csv structured importers", () => {
  let dbMock: any;
  let languageServiceMock: any;
  let appLoggerMock: any;
  let configServiceMock: any;

  let engine: InjectCsvEngine;

  beforeEach(() => {
    jest.clearAllMocks();

    // 1. Setup the Database Mock
    dbMock = {
      insertProductions: jest.fn().mockResolvedValue(undefined),
      insertLocations: jest.fn().mockResolvedValue(undefined),
      insertEvents: jest.fn().mockResolvedValue(undefined),
      insertTag: jest.fn().mockResolvedValue(500),
      getProductionByLegacyId: jest.fn(),
      linkTag: jest.fn().mockResolvedValue(true),
      insertBlog: jest.fn().mockResolvedValue({ id: 99 }),
      linkBlog: jest.fn().mockResolvedValue(true),
      getEventByLegacyId: jest.fn(),
      insertPrice: jest.fn().mockResolvedValue({ id: 66 }),
      linkPrice: jest.fn().mockResolvedValue(true),
    };

    // 2. Setup the LanguageService Mock (Just pass the data through unchanged)
    languageServiceMock = {
      translateObject: jest.fn().mockImplementation(async (data) => data),
    };

    // 3. Setup AppLogger and ConfigService Mocks
    appLoggerMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    configServiceMock = {
      get: jest.fn(),
    };

    // 4. Instantiate the class with the mocked dependencies
    engine = new InjectCsvEngine(
      dbMock,
      appLoggerMock,
      configServiceMock,
      languageServiceMock,
    );
  });

  it("injectProductionsCSV parses and inserts transformed productions", async () => {
    mockParseProductionsCSV.mockResolvedValue([
      {
        legacy_id: "csv-10",
        production: {
          titel: { en: "Hamlet", nl: "Hamlet" },
          description1: { en: "Desc", nl: "Beschrijving" },
          description2: null,
          artist: null,
          tagline: null,
          credits: null,
          performer_type: "actors",
          attendance_mode: "offline",
        },
      },
    ]);

    await engine.injectProductionsCSV("/tmp/productions.csv");

    expect(mockParseProductionsCSV).toHaveBeenCalledWith(
      "/tmp/productions.csv",
    );
    expect(dbMock.insertProductions).toHaveBeenCalledTimes(1);

    const inserted = dbMock.insertProductions.mock.calls[0][0];
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({
      legacy_id: "csv-10",
      title: { en: "Hamlet", nl: "Hamlet" },
      description: { en: "Desc", nl: "Beschrijving" },
      performer_type: "actors",
      attendance_mode: "offline",
    });
  });

  it("injectEventsCSV deduplicates locations and inserts transformed events", async () => {
    mockParseEventsCSV.mockResolvedValue([
      {
        legacy_id: "csv-1",
        event: {
          production_id: 15,
          starttime: "2026-01-01T10:00:00.000Z",
          endtime: null,
          doors_at: null,
          intermission_at: null,
        },
        location: { en: "Main Hall", nl: "Grote Zaal" },
      },
      {
        legacy_id: "csv-2",
        event: {
          production_id: 15,
          starttime: "2026-01-02T10:00:00.000Z",
          endtime: "2026-01-02T12:00:00.000Z",
          doors_at: null,
          intermission_at: null,
        },
        location: { en: "Main Hall", nl: "Grote Zaal" },
      },
    ]);

    await engine.injectEventsCSV("/tmp/events.csv");

    expect(mockParseEventsCSV).toHaveBeenCalledWith("/tmp/events.csv");

    const insertedLocations = dbMock.insertLocations.mock.calls[0][0];
    expect(insertedLocations).toHaveLength(1);
    expect(insertedLocations[0]).toMatchObject({
      legacy_id: "csv-Grote Zaal",
      name: { en: "Main Hall", nl: "Grote Zaal" },
    });

    const insertedEvents = dbMock.insertEvents.mock.calls[0][0];
    expect(insertedEvents).toHaveLength(2);
    expect(insertedEvents[0]).toMatchObject({
      legacy_id: "csv-1",
      production_id: "csv-15",
      location: "csv-Grote Zaal",
    });
    expect(insertedEvents[1]).toMatchObject({
      legacy_id: "csv-2",
      production_id: "csv-15",
      location: "csv-Grote Zaal",
    });
  });

  it("injectTagsCSV inserts tags and only links tags for existing productions", async () => {
    mockParseTagsCSV.mockResolvedValue([
      {
        tag: {
          tag: { en: "Theatre", nl: "Theater" },
        },
        productionIds: [7, 999],
      },
    ]);

    dbMock.getProductionByLegacyId
      .mockResolvedValueOnce({ id: 11 })
      .mockRejectedValueOnce(new Error("missing"));

    await engine.injectTagsCSV("/tmp/tags.csv");

    expect(dbMock.insertTag).toHaveBeenCalledWith(
      expect.objectContaining({
        legacy_id: "csv-Theater",
        name: { en: "Theatre", nl: "Theater" },
      }),
    );

    expect(dbMock.getProductionByLegacyId).toHaveBeenNthCalledWith(1, "csv-7");
    expect(dbMock.getProductionByLegacyId).toHaveBeenNthCalledWith(
      2,
      "csv-999",
    );

    expect(dbMock.linkTag).toHaveBeenCalledTimes(1);
    expect(dbMock.linkTag).toHaveBeenCalledWith(11, 500);
    expect(appLoggerMock.warn).toHaveBeenCalled();
  });

  it("injectBlogsCSV inserts blog and links only existing productions", async () => {
    mockParseBlogsCSV.mockResolvedValue([
      {
        production_id: 10,
        blog: { titel: "News", description: "Some text" },
      },
      {
        production_id: 404,
        blog: { titel: "Missing", description: "Should skip" },
      },
    ]);

    dbMock.getProductionByLegacyId
      .mockResolvedValueOnce({ id: 21 })
      .mockRejectedValueOnce(new Error("missing"));

    await engine.injectBlogsCSV("/tmp/blogs.csv");

    expect(dbMock.insertBlog).toHaveBeenCalledWith("News", "Some text");
    expect(dbMock.linkBlog).toHaveBeenCalledTimes(1);
    expect(dbMock.linkBlog).toHaveBeenCalledWith(21, 99);
    expect(appLoggerMock.warn).toHaveBeenCalled();
  });

  it("injectPricesCSV inserts price and links only existing events", async () => {
    mockParsePricesCSV.mockResolvedValue([
      {
        event_id: 3,
        price: {
          price: 20,
          name: { en: "Standard", nl: "Standaard" },
        },
      },
      {
        event_id: 404,
        price: {
          price: 10,
          name: { en: "Student", nl: "Student" },
        },
      },
    ]);

    dbMock.getEventByLegacyId
      .mockResolvedValueOnce({ id: 8 })
      .mockRejectedValueOnce(new Error("missing"));

    await engine.injectPricesCSV("/tmp/prices.csv");

    expect(dbMock.insertPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        legacy_id: "csv-Standaard",
        amount: 20,
      }),
    );

    expect(dbMock.linkPrice).toHaveBeenCalledTimes(1);
    expect(dbMock.linkPrice).toHaveBeenCalledWith(8, 66);
    expect(appLoggerMock.warn).toHaveBeenCalled();
  });
});
