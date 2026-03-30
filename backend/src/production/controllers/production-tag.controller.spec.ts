import { Test, TestingModule } from "@nestjs/testing";
import { ProductionTagController } from "./production-tag.controller";
import { ProductionService } from "../production.service";
import { LanguageService } from "../../util/language/language.service";
import {
  ProductionDto,
  TagDto,
  TagViewDto,
  LanguageQueryDto,
} from "../../dto/dto";
import { NotFoundException } from "@nestjs/common";
import { ApiKeyGuard, SuperApiKeyGuard } from "../../auth/authGuard";

describe("ProductionTagController", () => {
  let controller: ProductionTagController;
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

  const mockTags: TagDto[] = [
    {
      id: 1,
      tag: { en: "Drama", nl: "Drama" },
      created_at: "2025-06-01T22:00:00.000Z",
      updated_at: "2025-06-01T22:00:00.000Z",
    },
  ];

  const mockTagViews: TagViewDto[] = [
    {
      id: 1,
      tag: "Drama",
      created_at: "2025-06-01T22:00:00.000Z",
      updated_at: "2025-06-01T22:00:00.000Z",
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionTagController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getTagsById: jest.fn().mockResolvedValue(mockTags),
            addTagToProduction: jest.fn(),
            removeTagFromProduction: jest.fn(),
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

    controller = module.get<ProductionTagController>(ProductionTagController);
    service = module.get<ProductionService>(ProductionService);
    languageService = module.get<LanguageService>(LanguageService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getTagsOfProductionByID", () => {
    it("should return flattened tags for a production", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };
      jest
        .spyOn(languageService, "flattenByLanguage")
        .mockReturnValue(mockTagViews);

      const result = await controller.getTagsOfProductionByID(1, langQuery);

      expect(result).toEqual(mockTagViews);
      expect(service.getTagsById).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockTags,
        langQuery.lang,
      );
    });

    it("should return empty array when production has no tags", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };
      jest.spyOn(service, "getTagsById").mockResolvedValueOnce([]);
      jest.spyOn(languageService, "flattenByLanguage").mockReturnValue([]);

      const result = await controller.getTagsOfProductionByID(1, langQuery);
      expect(result).toEqual([]);
    });

    it("should throw a NotFoundException if the production does not exist", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };
      jest
        .spyOn(service, "getTagsById")
        .mockRejectedValueOnce(
          new NotFoundException("ProductionDto not found"),
        );

      await expect(
        controller.getTagsOfProductionByID(999, langQuery),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("addTagToProduction", () => {
    it("should add a tag to a production and return the production", async () => {
      jest
        .spyOn(service, "addTagToProduction")
        .mockResolvedValueOnce(mockProduction);

      const result = await controller.addTagToProduction(1, 2);

      expect(service.addTagToProduction).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockProduction);
    });

    it("should pass through errors if adding a tag fails", async () => {
      jest
        .spyOn(service, "addTagToProduction")
        .mockRejectedValueOnce(
          new NotFoundException("ProductionDto not found"),
        );

      await expect(controller.addTagToProduction(999, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("removeTagFromProduction", () => {
    it("should remove a tag from a production and return the production", async () => {
      jest
        .spyOn(service, "removeTagFromProduction")
        .mockResolvedValueOnce(mockProduction);

      const result = await controller.removeTagFromProduction(1, 2);

      expect(service.removeTagFromProduction).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockProduction);
    });

    it("should pass through errors if removing a tag fails", async () => {
      jest
        .spyOn(service, "removeTagFromProduction")
        .mockRejectedValueOnce(
          new NotFoundException("ProductionDto not found"),
        );

      await expect(controller.removeTagFromProduction(999, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
