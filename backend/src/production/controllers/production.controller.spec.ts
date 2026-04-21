import { Test, TestingModule } from "@nestjs/testing";
import { ProductionController } from "./production.controller";
import { ProductionService } from "../production.service";
import { LanguageService } from "../../util/language/language.service";
import {
  CreateProductionDto,
  ProductionDto,
  ProductionViewDto,
  ModifyProductionDto,
  LanguageQueryDto,
} from "../../dto/dto";
import { ApiKeyGuard, SuperApiKeyGuard } from "../../auth/authGuard";
import {
  FilterProductionSchema,
  LanguageQuerySchema,
  PaginationFilterSchema,
} from "@repo/common";
import { ResourceNotFoundException } from "../../common/exceptions";

describe("ProductionController", () => {
  let controller: ProductionController;
  let service: ProductionService;
  let languageService: LanguageService;

  const mockProduction: ProductionDto = {
    id: 1,
    titel: { en: "The Great Show", nl: "De Geweldige Show" },
    description1: {
      en: "An amazing production",
      nl: "Een geweldige productie",
    },
    description2: { en: "With great actors", nl: "Met geweldige acteurs" },
    performer_type: "happy",
    attendance_mode: "I",
    tagline: { en: "fixing", nl: "repareren" },
    artist: { en: "the", nl: "de" },
    credits: { en: "tests :-)", nl: "testen :-)" },
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  const mockProductionView: ProductionViewDto = {
    id: 1,
    titel: "The Great Show",
    description1: "An amazing production",
    description2: "With great actors",
    performer_type: "happy",
    attendance_mode: "I",
    tagline: "fixing",
    artist: "the",
    credits: "tests :-)",
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  const mockProductions: ProductionDto[] = [mockProduction];
  const mockProductionViews: ProductionViewDto[] = [mockProductionView];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getAllProductions: jest.fn().mockResolvedValue(mockProductions),
            getProductionById: jest.fn().mockResolvedValue(mockProduction),
            replaceProduction: jest.fn().mockResolvedValue(mockProduction),
            modifyProduction: jest.fn().mockResolvedValue(mockProduction),
            deleteProduction: jest.fn().mockResolvedValue(undefined),
            createProduction: jest.fn(),
            upsertProduction: jest.fn(),
          },
        },
        {
          provide: LanguageService,
          useValue: {
            flattenByLanguage: jest.fn(),
          },
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

    controller = module.get<ProductionController>(ProductionController);
    service = module.get<ProductionService>(ProductionService);
    languageService = module.get<LanguageService>(LanguageService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllProductions", () => {
    it("should return an array of flattened productions", async () => {
      const productionFilters = FilterProductionSchema.parse({});
      const paginationFilters = PaginationFilterSchema.parse({});
      const langQuery = LanguageQuerySchema.parse({ lang: "en" });

      jest
        .spyOn(languageService, "flattenByLanguage")
        .mockReturnValue(mockProductionViews);

      const result = await controller.getAllProductions(
        langQuery,
        paginationFilters,
        productionFilters,
      );

      expect(service.getAllProductions).toHaveBeenCalledWith(
        productionFilters,
        paginationFilters,
        langQuery.lang,
      );
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockProductions,
        langQuery.lang,
      );
      expect(result).toEqual(mockProductionViews);
    });

    it("should return empty array when no productions exist", async () => {
      const productionFilters = FilterProductionSchema.parse({});
      const paginationFilters = PaginationFilterSchema.parse({});
      const langQuery = LanguageQuerySchema.parse({ lang: "en" });

      jest.spyOn(service, "getAllProductions").mockResolvedValueOnce({
        page: 0,
        limit: 20,
        totalItems: 0,
        objects: [],
      });
      jest.spyOn(languageService, "flattenByLanguage").mockReturnValue({
        page: 0,
        limit: 20,
        totalItems: 0,
        objects: [],
      });

      const result = await controller.getAllProductions(
        langQuery,
        paginationFilters,
        productionFilters,
      );

      expect(result).toEqual({
        page: 0,
        limit: 20,
        totalItems: 0,
        objects: [],
      });
    });
  });

  describe("getById", () => {
    it("should return a single flattened production by id", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };
      jest
        .spyOn(languageService, "flattenByLanguage")
        .mockReturnValue(mockProductionView);

      const result = await controller.getProductionById(1, langQuery);

      expect(service.getProductionById).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockProduction,
        langQuery.lang,
      );
      expect(result).toEqual(mockProductionView);
    });

    it("should throw a ResourceNotFoundException (410) if the production does not exist", async () => {
      jest
        .spyOn(service, "getProductionById")
        .mockRejectedValue(new ResourceNotFoundException(ProductionDto, 999));
      await expect(controller.getProductionById(999, {})).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe("replaceProduction", () => {
    it("should replace and return the production", async () => {
      const result = await controller.replaceProduction(1, mockProduction);
      expect(service.replaceProduction).toHaveBeenCalledWith(1, mockProduction);
      expect(result).toEqual(mockProduction);
    });

    it("should throw a ResourceNotFoundException (410) if trying to replace a non-existent production", async () => {
      jest
        .spyOn(service, "replaceProduction")
        .mockRejectedValue(new ResourceNotFoundException(ProductionDto, 999));
      await expect(
        controller.replaceProduction(999, mockProduction),
      ).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe("modifyProduction", () => {
    it("should modify and return the production", async () => {
      const patchData: ModifyProductionDto = {
        titel: { en: "A New titel", nl: "Nieuwe titel" },
      };
      const patchedProduction = {
        ...mockProduction,
        titel: { en: "A New titel", nl: "Nieuwe titel" },
      };

      jest
        .spyOn(service, "modifyProduction")
        .mockResolvedValueOnce(patchedProduction);

      const result = await controller.modifyProduction(1, patchData);
      expect(service.modifyProduction).toHaveBeenCalledWith(1, patchData);
      expect(result).toEqual(patchedProduction);
    });

    it("should throw a ResourceNotFoundException (410) if trying to modify a non-existent production", async () => {
      const patchData: ModifyProductionDto = {
        titel: { en: "A New titel", nl: "Nieuwe titel" },
      };
      jest
        .spyOn(service, "modifyProduction")
        .mockRejectedValueOnce(
          new ResourceNotFoundException(ProductionDto, 999),
        );
      await expect(controller.modifyProduction(999, patchData)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe("deleteProduction", () => {
    it("should delete the production by id", async () => {
      const result = await controller.deleteProduction(1);
      expect(service.deleteProduction).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  describe("createProduction", () => {
    it("should create a production successfully", async () => {
      const newProduction: CreateProductionDto = {
        titel: { en: "The Great Show", nl: "De Geweldige Show" },
        description1: {
          en: "An amazing production",
          nl: "Een geweldige productie",
        },
        description2: { en: "With great actors", nl: "Met geweldige acteurs" },
        performer_type: "happy",
        attendance_mode: "I",
        tagline: { en: "fixing", nl: "repareren" },
        artist: { en: "the", nl: "de" },
        credits: { en: "tests :-)", nl: "testen :-)" },
      };

      const createdProduction: ProductionDto = {
        id: 2,
        ...newProduction,
        created_at: "2025-06-01T22:00:00.000Z",
        updated_at: "2025-06-01T22:00:00.000Z",
      };

      jest
        .spyOn(service, "createProduction")
        .mockResolvedValueOnce(createdProduction);

      const result = await controller.createProduction(newProduction);

      expect(service.createProduction).toHaveBeenCalledWith(newProduction);
      expect(result).toEqual(createdProduction);
    });

    it("should handle database errors when creation fails", async () => {
      const newProduction: CreateProductionDto = {
        titel: { en: "The Great Show", nl: "De Geweldige Show" },
        description1: {
          en: "An amazing production",
          nl: "Een geweldige productie",
        },
        description2: { en: "With great actors", nl: "Met geweldige acteurs" },
        performer_type: "happy",
        attendance_mode: "I",
        tagline: { en: "fixing", nl: "repareren" },
        artist: { en: "the", nl: "de" },
        credits: { en: "tests :-)", nl: "testen :-)" },
      };

      jest
        .spyOn(service, "createProduction")
        .mockRejectedValueOnce(new Error("Failed to create production"));

      await expect(controller.createProduction(newProduction)).rejects.toThrow(
        "Failed to create production",
      );
    });
  });
});
