import { Test, TestingModule } from "@nestjs/testing";
import { SeriesService } from "./series.service";
import { SeriesDatabaseService } from "../database/db.series.service";
import { PaginationFilterDto } from "../dto/dto";
import { ApiKeyGuard, SuperApiKeyGuard } from "../auth/authGuard";

describe("SeriesService", () => {
  let service: SeriesService;
  let dbService: SeriesDatabaseService;

  const mockSeriesDbService = {
    getSeriesById: jest.fn(),
    getSeries: jest.fn(),
    createSeries: jest.fn(),
    updateSeries: jest.fn(),
    deleteSeries: jest.fn(),
    getProductionsFromSeries: jest.fn(),
    linkProductionsToSeries: jest.fn(),
    unlinkProductionFromSeries: jest.fn(),
  };

  const mockSeriesDto = {
    id: 1,
    titel: { en: "Test" },
    desc: { en: "Desc" },
    created_at: "date",
    updated_at: "date",
  };
  const mockPaginatedSeries = { data: [mockSeriesDto], total: 1 };
  const mockPaginationFilter: PaginationFilterDto = {
    limit: 10,
    page: 0,
    descending: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: SeriesDatabaseService,
          useValue: mockSeriesDbService,
        },
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

    service = module.get<SeriesService>(SeriesService);
    dbService = module.get<SeriesDatabaseService>(SeriesDatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getSeriesById", () => {
    it("should fetch a series by ID", async () => {
      mockSeriesDbService.getSeriesById.mockResolvedValue(mockSeriesDto);
      const result = await service.getSeriesById(1);
      expect(result).toEqual(mockSeriesDto);
      expect(dbService.getSeriesById).toHaveBeenCalledWith(1);
    });
  });

  describe("getSeries", () => {
    it("should fetch a paginated list of series", async () => {
      mockSeriesDbService.getSeries.mockResolvedValue(mockPaginatedSeries);
      const result = await service.getSeries(
        mockPaginationFilter,
        {
          is_suggestion: false,
        },
        undefined,
      );
      expect(result).toEqual(mockPaginatedSeries);
      expect(dbService.getSeries).toHaveBeenCalledWith(
        mockPaginationFilter,
        {
          is_suggestion: false,
        },
        undefined,
      );
    });
  });

  describe("createSeries", () => {
    it("should create a new series", async () => {
      const dto = {
        titel: { en: "New", nl: "New" },
        description: { en: "Desc", nl: "Desc" },
      };
      mockSeriesDbService.createSeries.mockResolvedValue(mockSeriesDto);
      const result = await service.createSeries(dto);
      expect(result).toEqual(mockSeriesDto);
      expect(dbService.createSeries).toHaveBeenCalledWith(dto);
    });
  });

  describe("updateSeries", () => {
    it("should update an existing series", async () => {
      const dto = { titel: { en: "Updated", nl: "Updated" } };
      mockSeriesDbService.updateSeries.mockResolvedValue(mockSeriesDto);
      const result = await service.updateSeries(1, dto);
      expect(result).toEqual(mockSeriesDto);
      expect(dbService.updateSeries).toHaveBeenCalledWith(1, dto);
    });
  });

  describe("deleteSeries", () => {
    it("should delete a series", async () => {
      mockSeriesDbService.deleteSeries.mockResolvedValue(undefined);
      await service.deleteSeries(1);
      expect(dbService.deleteSeries).toHaveBeenCalledWith(1);
    });
  });

  describe("Productions Sub-routes", () => {
    it("should get series productions", async () => {
      const mockProductions = { data: [{ id: 1 }], total: 1 };
      mockSeriesDbService.getProductionsFromSeries.mockResolvedValue(
        mockProductions,
      );

      const result = await service.getSeriesProductions(
        1,
        mockPaginationFilter,
      );
      expect(result).toEqual(mockProductions);
      expect(dbService.getProductionsFromSeries).toHaveBeenCalledWith(
        1,
        mockPaginationFilter,
      );
    });

    it("should link productions to series", async () => {
      mockSeriesDbService.linkProductionsToSeries.mockResolvedValue(undefined);
      await service.linkProductionsToSeries(1, [2, 3]);
      expect(dbService.linkProductionsToSeries).toHaveBeenCalledWith([2, 3], 1);
    });

    it("should unlink a production from a series", async () => {
      mockSeriesDbService.unlinkProductionFromSeries.mockResolvedValue(
        undefined,
      );
      await service.unlinkProductionFromSeries(1, 2);
      expect(dbService.unlinkProductionFromSeries).toHaveBeenCalledWith(2, 1);
    });
  });
});
