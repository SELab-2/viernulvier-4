import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { ParserController } from "./parser.controller";
import { CsvInjectionService } from "../util/scraper/csv-injection.service";
import { ApiKeyGuard } from "../auth/authGuard";

describe("ParserController", () => {
  let controller: ParserController;
  let csvInjectionService: CsvInjectionService;

  const mockCsvInjectionService = {
    injectProductionsCSV: jest.fn(),
    injectEventsCSV: jest.fn(),
    injectTagsCSV: jest.fn(),
    injectBlogsCSV: jest.fn(),
    injectPricesCSV: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParserController],
      providers: [
        {
          provide: CsvInjectionService,
          useValue: mockCsvInjectionService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ParserController>(ParserController);
    csvInjectionService = module.get<CsvInjectionService>(CsvInjectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should be defined", () => {
      expect(controller).toBeDefined();
    });
  });

  describe("injectProductions", () => {
    it("should inject productions CSV data", async () => {
      const csvBuffer = Buffer.from("ID,Titel_NL\n1,Test\n", "utf8");
      const expectedResult = { inserted: 10 };
      mockCsvInjectionService.injectProductionsCSV.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.injectProductions({ buffer: csvBuffer });

      expect(csvInjectionService.injectProductionsCSV).toHaveBeenCalledWith(
        csvBuffer,
      );
      expect(csvInjectionService.injectProductionsCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it("should accept known csv mimetype", async () => {
      const csvBuffer = Buffer.from("ID,Titel_NL\n1,Test\n", "utf8");
      const expectedResult = { inserted: 10 };
      mockCsvInjectionService.injectProductionsCSV.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.injectProductions({
        buffer: csvBuffer,
        mimetype: "text/csv",
      });

      expect(csvInjectionService.injectProductionsCSV).toHaveBeenCalledWith(
        csvBuffer,
      );
      expect(result).toEqual(expectedResult);
    });

    it("should throw for unsupported uploaded mimetype", async () => {
      const csvBuffer = Buffer.from("ID,Titel_NL\n1,Test\n", "utf8");

      await expect(
        controller.injectProductions({
          buffer: csvBuffer,
          mimetype: "application/pdf",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(csvInjectionService.injectProductionsCSV).not.toHaveBeenCalled();
    });

    it("should fallback to filePath when no uploaded file is provided", async () => {
      const filePath = "test/productions.csv";
      const expectedResult = { inserted: 10 };
      mockCsvInjectionService.injectProductionsCSV.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.injectProductions(undefined, filePath);

      expect(csvInjectionService.injectProductionsCSV).toHaveBeenCalledWith(
        filePath,
      );
      expect(result).toEqual(expectedResult);
    });

    it("should throw when neither file nor filePath is provided", async () => {
      await expect(
        controller.injectProductions(undefined, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("injectEvents", () => {
    it("should inject events CSV data", async () => {
      const csvBuffer = Buffer.from(
        "ID,Production,Starttime\n1,1,2025-01-01\n",
      );
      const expectedResult = { inserted: 12 };
      mockCsvInjectionService.injectEventsCSV.mockResolvedValue(expectedResult);

      const result = await controller.injectEvents({ buffer: csvBuffer });

      expect(csvInjectionService.injectEventsCSV).toHaveBeenCalledWith(
        csvBuffer,
      );
      expect(csvInjectionService.injectEventsCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("injectTags", () => {
    it("should inject tags CSV data", async () => {
      const csvBuffer = Buffer.from("TagName_NL,ProductionIDs\nTheater,1\n");
      const expectedResult = { inserted: 8 };
      mockCsvInjectionService.injectTagsCSV.mockResolvedValue(expectedResult);

      const result = await controller.injectTags({ buffer: csvBuffer });

      expect(csvInjectionService.injectTagsCSV).toHaveBeenCalledWith(csvBuffer);
      expect(csvInjectionService.injectTagsCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("injectBlogs", () => {
    it("should inject blogs CSV data", async () => {
      const csvBuffer = Buffer.from(
        "Titel_NL,Description_NL,ProductionID\nA,B,1\n",
      );
      const expectedResult = { inserted: 6 };
      mockCsvInjectionService.injectBlogsCSV.mockResolvedValue(expectedResult);

      const result = await controller.injectBlogs({ buffer: csvBuffer });

      expect(csvInjectionService.injectBlogsCSV).toHaveBeenCalledWith(
        csvBuffer,
      );
      expect(csvInjectionService.injectBlogsCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("injectPrices", () => {
    it("should inject prices CSV data", async () => {
      const csvBuffer = Buffer.from("Name_NL,Price,EventID\nStd,12.5,1\n");
      const expectedResult = { inserted: 5 };
      mockCsvInjectionService.injectPricesCSV.mockResolvedValue(expectedResult);

      const result = await controller.injectPrices({ buffer: csvBuffer });

      expect(csvInjectionService.injectPricesCSV).toHaveBeenCalledWith(
        csvBuffer,
      );
      expect(csvInjectionService.injectPricesCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
