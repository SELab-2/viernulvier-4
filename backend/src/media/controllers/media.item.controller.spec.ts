// media.item.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { MediaItemController } from "./media.item.controller";
import { MediaItemService } from "../services/media.item.service";
import { LanguageService } from "../../util/language/language.service";
import { ApiKeyGuard } from "../../auth/authGuard";
import { PaginatedResponse } from "@repo/common";
import {
  CreateMediaItemDto,
  MediaItemDto,
  MediaItemViewDto,
  ModifyMediaItemDto,
  ReplaceMediaItemDto,
  PaginationFilterDto,
  LanguageQueryDto,
  MediaCropDto,
} from "../../dto/dto";

describe("MediaItemController", () => {
  let controller: MediaItemController;
  let mediaItemService: jest.Mocked<MediaItemService>;
  let languageService: jest.Mocked<LanguageService>;

  const mockItem: MediaItemDto = {
    id: 1,
    type: "image",
    original_filename: "test.png",
    position: "main",
    width: 1920,
    height: 1080,
    title: { en: "Vid Title", nl: "Vid Title" },
    description: { en: "Vid Desc", nl: "Vid Desc" },
    credits: { en: "Vid Credits", nl: "Vid Credits" },
    created_at: "2026-03-28T14:00:00.000Z",
    updated_at: "2026-03-28T14:00:00.000Z",
  };

  const mockItemView: MediaItemViewDto = {
    ...mockItem,
    title: "Title",
    description: "Desc",
    credits: "Credits",
  };

  beforeEach(async () => {
    const mockMediaItemService = {
      getItems: jest.fn(),
      getItemById: jest.fn(),
      createItem: jest.fn(),
      replaceItem: jest.fn(),
      modifyItem: jest.fn(),
      deleteItem: jest.fn(),
      getItemCrops: jest.fn(),
      linkCropToItem: jest.fn(),
      unlinkCropFromItem: jest.fn(),
    };

    const mockLanguageService = {
      flattenByLanguage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaItemController],
      providers: [
        {
          provide: MediaItemService,
          useValue: mockMediaItemService,
        },
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<MediaItemController>(MediaItemController);
    mediaItemService = module.get(MediaItemService);
    languageService = module.get(LanguageService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getItems", () => {
    it("should fetch, flatten, and return a paginated list of items", async () => {
      const paginationFilter: PaginationFilterDto = {
        page: 1,
        limit: 10,
        descending: true,
      };
      const langQuery: LanguageQueryDto = { lang: "en" };
      const paginatedItems: PaginatedResponse<MediaItemDto> = {
        objects: [mockItem],
        totalItems: 1,
        page: 1,
        limit: 10,
      };

      const expectedFlattened: PaginatedResponse<MediaItemViewDto> = {
        ...paginatedItems,
        objects: [mockItemView],
      };

      mediaItemService.getItems.mockResolvedValue(paginatedItems);
      languageService.flattenByLanguage.mockReturnValue(expectedFlattened);

      const result = await controller.getItems(paginationFilter, langQuery);

      expect(mediaItemService.getItems).toHaveBeenCalledWith(paginationFilter);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        paginatedItems,
        "en",
      );
      expect(result).toEqual(expectedFlattened);
    });
  });

  describe("getItemById", () => {
    it("should fetch, flatten, and return a single item", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      mediaItemService.getItemById.mockResolvedValue(mockItem);
      languageService.flattenByLanguage.mockReturnValue(mockItemView);

      const result = await controller.getItemById(1, langQuery);

      expect(mediaItemService.getItemById).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockItem,
        "en",
      );
      expect(result).toEqual(mockItemView);
    });
  });

  describe("createItem", () => {
    it("should create and return a new item", async () => {
      const createItemDto: CreateMediaItemDto = {
        type: "image",
        original_filename: "test.png",
        position: "main",
        width: 1920,
        height: 1080,
        title: { en: "Vid Title", nl: "Vid Title" },
        description: { en: "Vid Desc", nl: "Vid Desc" },
        credits: { en: "Vid Credits", nl: "Vid Credits" },
      };
      mediaItemService.createItem.mockResolvedValue(mockItem);

      const result = await controller.createItem(createItemDto);

      expect(mediaItemService.createItem).toHaveBeenCalledWith(createItemDto);
      expect(result).toEqual(mockItem);
    });
  });

  describe("replaceItem", () => {
    it("should replace and return the item", async () => {
      const replaceItemDto: ReplaceMediaItemDto = {
        type: "image",
        original_filename: "test.png",
        position: "main",
        width: 1920,
        height: 1080,
        title: { en: "Vid Title", nl: "Vid Title" },
        description: { en: "Vid Desc", nl: "Vid Desc" },
        credits: { en: "Vid Credits", nl: "Vid Credits" },
      };
      mediaItemService.replaceItem.mockResolvedValue(mockItem);

      const result = await controller.replaceItem(1, replaceItemDto);

      expect(mediaItemService.replaceItem).toHaveBeenCalledWith(
        1,
        replaceItemDto,
      );
      expect(result).toEqual(mockItem);
    });
  });

  describe("modifyItem", () => {
    it("should modify and return the item", async () => {
      const modifyItemDto: ModifyMediaItemDto = { position: "carousel" };
      mediaItemService.modifyItem.mockResolvedValue(mockItem);

      const result = await controller.modifyItem(1, modifyItemDto);

      expect(mediaItemService.modifyItem).toHaveBeenCalledWith(
        1,
        modifyItemDto,
      );
      expect(result).toEqual(mockItem);
    });
  });

  describe("deleteItem", () => {
    it("should delete the item", async () => {
      mediaItemService.deleteItem.mockResolvedValue(undefined);

      await controller.deleteItem(1);

      expect(mediaItemService.deleteItem).toHaveBeenCalledWith(1);
    });
  });

  describe("getItemCrops", () => {
    it("should return all crops for an item", async () => {
      const mockCrops: MediaCropDto[] = [
        { id: 1, name: "hd_ready" } as MediaCropDto,
      ];
      mediaItemService.getItemCrops.mockResolvedValue(mockCrops);

      const result = await controller.getItemCrops(1);

      expect(mediaItemService.getItemCrops).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCrops);
    });
  });

  describe("linkCropToItem", () => {
    it("should link a crop to an item", async () => {
      mediaItemService.linkCropToItem.mockResolvedValue(undefined);

      await controller.linkCropToItem(1, 2);

      expect(mediaItemService.linkCropToItem).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("unlinkCropFromItem", () => {
    it("should unlink a crop from an item", async () => {
      mediaItemService.unlinkCropFromItem.mockResolvedValue(undefined);

      await controller.unlinkCropFromItem(1, 2);

      expect(mediaItemService.unlinkCropFromItem).toHaveBeenCalledWith(1, 2);
    });
  });
});
