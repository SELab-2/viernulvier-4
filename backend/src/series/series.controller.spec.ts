import { Test, TestingModule } from "@nestjs/testing";
import { SeriesController } from "./series.controller";
import { SeriesService } from "./series.service";
import { LanguageService } from "../util/language/language.service";
import { LanguageQueryDto, PaginationFilterDto } from "../dto/dto";
import { ApiKeyGuard, SuperApiKeyGuard } from "../auth/authGuard";

describe("SeriesController", () => {
  let controller: SeriesController;
  let service: SeriesService;
  let languageService: LanguageService;

  const mockSeriesService = {
    getSeries: jest.fn(),
    getSeriesById: jest.fn(),
    createSeries: jest.fn(),
    updateSeries: jest.fn(),
    deleteSeries: jest.fn(),
    getSeriesProductions: jest.fn(),
    linkProductionsToSeries: jest.fn(),
    unlinkProductionFromSeries: jest.fn(),
  };

  const mockLanguageService = {
    flattenByLanguage: jest.fn((data: unknown) => data), // Mock passthrough
  };

  const mockLang: LanguageQueryDto = { lang: "en" };
  const mockPaginationFilter: PaginationFilterDto = {
    limit: 10,
    page: 0,
    descending: true,
  };
  const mockSeriesDto = { id: 1, titel: "Test", desc: "Desc" };
  const mockPaginatedSeries = { data: [mockSeriesDto], total: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeriesController],
      providers: [
        { provide: SeriesService, useValue: mockSeriesService },
        { provide: LanguageService, useValue: mockLanguageService },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(SuperApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<SeriesController>(SeriesController);
    service = module.get<SeriesService>(SeriesService);
    languageService = module.get<LanguageService>(LanguageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getSeries", () => {
    it("should return paginated series and flatten by language", async () => {
      mockSeriesService.getSeries.mockResolvedValue(mockPaginatedSeries);

      const result = await controller.getSeries(
        mockLang,
        mockPaginationFilter,
        { is_suggestion: false },
      );

      expect(result).toEqual(mockPaginatedSeries);
      expect(service.getSeries).toHaveBeenCalledWith(
        mockPaginationFilter,
        {
          is_suggestion: false,
        },
        mockLang.lang,
      );
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockPaginatedSeries,
        mockLang.lang,
      );
    });
  });

  describe("getSeriesById", () => {
    it("should return a series by ID and flatten by language", async () => {
      mockSeriesService.getSeriesById.mockResolvedValue(mockSeriesDto);

      const result = await controller.getSeriesById(1, mockLang);

      expect(result).toEqual(mockSeriesDto);
      expect(service.getSeriesById).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockSeriesDto,
        mockLang.lang,
      );
    });
  });

  describe("createSeries", () => {
    it("should call service to create a series", async () => {
      const dto = {
        titel: { en: "Replaced", nl: "Replaced" },
        description: { en: "Desc", nl: "Desc" },
      };
      mockSeriesService.createSeries.mockResolvedValue(mockSeriesDto);

      const result = await controller.createSeries(dto);

      expect(result).toEqual(mockSeriesDto);
      expect(service.createSeries).toHaveBeenCalledWith(dto);
    });
  });

  describe("replaceSeries", () => {
    it("should call service to replace a series", async () => {
      const dto = {
        titel: { en: "Replaced", nl: "Replaced" },
        description: { en: "Desc", nl: "Desc" },
      };
      mockSeriesService.updateSeries.mockResolvedValue(mockSeriesDto);

      const result = await controller.replaceSeries(1, dto);

      expect(result).toEqual(mockSeriesDto);
      expect(service.updateSeries).toHaveBeenCalledWith(1, dto);
    });
  });

  describe("modifySeries", () => {
    it("should call service to modify a series", async () => {
      const dto = { titel: { en: "Modified", nl: "Modified" } };
      mockSeriesService.updateSeries.mockResolvedValue(mockSeriesDto);

      const result = await controller.modifySeries(1, dto);

      expect(result).toEqual(mockSeriesDto);
      expect(service.updateSeries).toHaveBeenCalledWith(1, dto);
    });
  });

  describe("deleteSeries", () => {
    it("should call service to delete a series", async () => {
      mockSeriesService.deleteSeries.mockResolvedValue(undefined);

      await controller.deleteSeries(1);

      expect(service.deleteSeries).toHaveBeenCalledWith(1);
    });
  });

  describe("Productions Sub-routes", () => {
    it("should return series productions flattened by language", async () => {
      const mockProductions = { data: [{ id: 1 }], total: 1 };
      mockSeriesService.getSeriesProductions.mockResolvedValue(mockProductions);

      const result = await controller.getSeriesProductions(
        1,
        mockLang,
        mockPaginationFilter,
      );

      expect(result).toEqual(mockProductions);
      expect(service.getSeriesProductions).toHaveBeenCalledWith(
        1,
        mockPaginationFilter,
      );
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockProductions,
        mockLang.lang,
      );
    });

    it("should call service to link productions to series", async () => {
      mockSeriesService.linkProductionsToSeries.mockResolvedValue(undefined);

      await controller.linkProductionsToSeries(1, [2, 3]);

      expect(service.linkProductionsToSeries).toHaveBeenCalledWith(1, [2, 3]);
    });

    it("should call service to unlink production from series", async () => {
      mockSeriesService.unlinkProductionFromSeries.mockResolvedValue(undefined);

      await controller.unlinkProductionFromSeries(1, 2);

      expect(service.unlinkProductionFromSeries).toHaveBeenCalledWith(1, 2);
    });
  });
});
