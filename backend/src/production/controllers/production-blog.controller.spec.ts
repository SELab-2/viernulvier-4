import { Test, TestingModule } from "@nestjs/testing";
import { ProductionBlogController } from "./production-blog.controller";
import { ProductionService } from "../production.service";
import { LanguageService } from "../../util/language/language.service";
import {
  BlogDto,
  BlogViewDto,
  ProductionDto,
  LanguageQueryDto,
} from "../../dto/dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ApiKeyGuard, SuperApiKeyGuard } from "../../auth/authGuard";

describe("ProductionBlogController", () => {
  let controller: ProductionBlogController;
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
    legacy_id: "am",
    tagline: { en: "fixing", nl: "repareren" },
    artist: { en: "the", nl: "de" },
    credits: { en: "tests :-)", nl: "testen :-)" },
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  const mockBlog: BlogDto = {
    id: 1,
    titel: { en: "Behind the Scenes", nl: "Achter de schermen" },
    description: {
      en: "Looking at the set of The Great Show.",
      nl: "Kijken naar de set van De Geweldige Show.",
    },
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  const mockBlogView: BlogViewDto = {
    id: 1,
    titel: "Behind the Scenes",
    description: "Looking at the set of The Great Show.",
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionBlogController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getProductionBlogs: jest.fn(),
            linkBlogToProduction: jest.fn(),
            unlinkBlogFromProduction: jest.fn(),
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

    controller = module.get<ProductionBlogController>(ProductionBlogController);
    service = module.get<ProductionService>(ProductionService);
    languageService = module.get<LanguageService>(LanguageService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getProductionBlogs", () => {
    it("should return an array of flattened blogs linked to the production", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };
      const expectedBlogs = [mockBlog];
      const expectedBlogViews = [mockBlogView];

      jest
        .spyOn(service, "getProductionBlogs")
        .mockResolvedValueOnce(expectedBlogs);

      jest
        .spyOn(languageService, "flattenByLanguage")
        .mockReturnValue(expectedBlogViews);

      const result = await controller.getProductionBlogs(1, langQuery);

      expect(service.getProductionBlogs).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        expectedBlogs,
        langQuery.lang,
      );
      expect(result).toEqual(expectedBlogViews);
    });

    it("should throw a NotFoundException if the production is not found", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };
      jest
        .spyOn(service, "getProductionBlogs")
        .mockRejectedValueOnce(new NotFoundException());

      await expect(
        controller.getProductionBlogs(999, langQuery),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("linkBlogToProduction", () => {
    it("should link a blog to a production and return the blog", async () => {
      jest
        .spyOn(service, "linkBlogToProduction")
        .mockResolvedValueOnce(mockBlog);

      const result = await controller.linkBlogToProduction(1, 2);

      expect(service.linkBlogToProduction).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockBlog);
    });

    it("should pass through errors when linking fails", async () => {
      jest
        .spyOn(service, "linkBlogToProduction")
        .mockRejectedValueOnce(new BadRequestException("Already linked"));

      await expect(controller.linkBlogToProduction(1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("unlinkBlogFromProduction", () => {
    it("should unlink a blog from a production and return the production", async () => {
      jest
        .spyOn(service, "unlinkBlogFromProduction")
        .mockResolvedValueOnce(mockProduction);

      const result = await controller.unlinkBlogFromProduction(1, 2);

      expect(service.unlinkBlogFromProduction).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockProduction);
    });

    it("should pass through errors when unlinking fails", async () => {
      jest
        .spyOn(service, "unlinkBlogFromProduction")
        .mockRejectedValueOnce(new NotFoundException("Link not found"));

      await expect(controller.unlinkBlogFromProduction(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
