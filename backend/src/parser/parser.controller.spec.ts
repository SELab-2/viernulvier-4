import { Test, TestingModule } from "@nestjs/testing";
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
      const filePath = "test/productions.csv";
      const expectedResult = { inserted: 10 };
      mockCsvInjectionService.injectProductionsCSV.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.injectProductions(filePath);

      expect(csvInjectionService.injectProductionsCSV).toHaveBeenCalledWith(
        filePath,
      );
      expect(csvInjectionService.injectProductionsCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("injectEvents", () => {
    it("should inject events CSV data", async () => {
      const filePath = "test/events.csv";
      const expectedResult = { inserted: 12 };
      mockCsvInjectionService.injectEventsCSV.mockResolvedValue(expectedResult);

      const result = await controller.injectEvents(filePath);

      expect(csvInjectionService.injectEventsCSV).toHaveBeenCalledWith(
        filePath,
      );
      expect(csvInjectionService.injectEventsCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("injectTags", () => {
    it("should inject tags CSV data", async () => {
      const filePath = "test/tags.csv";
      const expectedResult = { inserted: 8 };
      mockCsvInjectionService.injectTagsCSV.mockResolvedValue(expectedResult);

      const result = await controller.injectTags(filePath);

      expect(csvInjectionService.injectTagsCSV).toHaveBeenCalledWith(filePath);
      expect(csvInjectionService.injectTagsCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("injectBlogs", () => {
    it("should inject blogs CSV data", async () => {
      const filePath = "test/blogs.csv";
      const expectedResult = { inserted: 6 };
      mockCsvInjectionService.injectBlogsCSV.mockResolvedValue(expectedResult);

      const result = await controller.injectBlogs(filePath);

      expect(csvInjectionService.injectBlogsCSV).toHaveBeenCalledWith(filePath);
      expect(csvInjectionService.injectBlogsCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("injectPrices", () => {
    it("should inject prices CSV data", async () => {
      const filePath = "test/prices.csv";
      const expectedResult = { inserted: 5 };
      mockCsvInjectionService.injectPricesCSV.mockResolvedValue(expectedResult);

      const result = await controller.injectPrices(filePath);

      expect(csvInjectionService.injectPricesCSV).toHaveBeenCalledWith(
        filePath,
      );
      expect(csvInjectionService.injectPricesCSV).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
