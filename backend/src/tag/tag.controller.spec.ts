import { Test, TestingModule } from "@nestjs/testing";
import { TagController } from "./tag.controller";
import { TagService } from "./tag.service";
import { LanguageService } from "../util/language/language.service";
import {
  CreateTagDto,
  LanguageQueryDto,
  PaginationFilterDto,
  TagDto,
  TagViewDto,
  UpdateTagDto,
} from "../dto/dto";
import { NotFoundException } from "@nestjs/common";
import { ApiKeyGuard, SuperApiKeyGuard } from "../auth/authGuard";

describe("TagController", () => {
  let controller: TagController;
  let service: TagService;
  let languageService: LanguageService;

  // Updated to match localized TagSchema
  const mockTag: TagDto = {
    id: 1,
    tag: {
      en: "Drama",
      nl: "Drama",
    },
    created_at: "2024-01-15T19:00:00.000Z",
    updated_at: "2024-01-15T19:00:00.000Z",
  };

  // What the LanguageService will output
  const mockTagView: TagViewDto = {
    id: 1,
    tag: "Drama",
    created_at: "2024-01-15T19:00:00.000Z",
    updated_at: "2024-01-15T19:00:00Z",
  };

  const filter: PaginationFilterDto = {
    limit: 10,
    page: 1,
  };

  const mockTags: TagDto[] = [mockTag];
  const mockTagViews: TagViewDto[] = [mockTagView];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: {
            getAllTags: jest.fn().mockResolvedValue(mockTags),
            getTagById: jest.fn().mockResolvedValue(mockTag),
            createTag: jest.fn().mockResolvedValue(mockTag),
            updateTag: jest.fn().mockResolvedValue(mockTag),
            deleteTag: jest.fn().mockResolvedValue({ message: "Success" }),
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

    controller = module.get<TagController>(TagController);
    service = module.get<TagService>(TagService);
    languageService = module.get<LanguageService>(LanguageService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllTags", () => {
    it("should return an array of flattened tags", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      jest
        .spyOn(languageService, "flattenByLanguage")
        .mockReturnValue(mockTagViews);

      const result = await controller.getAllTags(langQuery, filter);

      expect(result).toEqual(mockTagViews);
      expect(service.getAllTags).toHaveBeenCalled();
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockTags,
        langQuery.lang,
      );
    });
  });

  describe("getTagById", () => {
    it("should return a single flattened tag by id", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      jest
        .spyOn(languageService, "flattenByLanguage")
        .mockReturnValue(mockTagView);

      const result = await controller.getTagById(1, langQuery);

      expect(result).toEqual(mockTagView);
      expect(service.getTagById).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockTag,
        langQuery.lang,
      );
    });

    it("should throw NotFoundException if tag not found", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      jest
        .spyOn(service, "getTagById")
        .mockRejectedValue(new NotFoundException());

      await expect(controller.getTagById(999, langQuery)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("createTag", () => {
    it("should create and return a new tag", async () => {
      const dto: CreateTagDto = {
        tag: { en: "Action", nl: "Actie" },
      };
      const result = await controller.createTag(dto);

      expect(service.createTag).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTag);
    });
  });

  describe("updateTag", () => {
    it("should update and return the tag", async () => {
      const dto: UpdateTagDto = { tag: { en: "Updated", nl: "Bijgewerkt" } };
      const result = await controller.updateTag(1, dto);

      expect(service.updateTag).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockTag);
    });
  });

  describe("deleteTag", () => {
    it("should call service.deleteTag", async () => {
      await controller.deleteTag(1);
      expect(service.deleteTag).toHaveBeenCalledWith(1);
    });
  });
});
