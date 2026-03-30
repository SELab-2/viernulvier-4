// media.item.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { MediaItemService } from "./media.item.service";
import { MediaDatabaseService } from "../../database/db.media.service";
import { PaginatedResponse } from "@repo/common";
import {
  CreateMediaItemDto,
  MediaItemDto,
  ModifyMediaItemDto,
  ReplaceMediaItemDto,
  PaginationFilterDto,
  MediaCropDto,
} from "../../dto/dto";

describe("MediaItemService", () => {
  let service: MediaItemService;
  let mediaDbService: jest.Mocked<MediaDatabaseService>;

  const mockItem: MediaItemDto = {
    id: 1,
    type: "image",
    original_filename: "test-image.png",
    position: "main",
    width: 1920,
    height: 1080,
    title: { en: "Vid Title", nl: "Vid Title" },
    description: { en: "Vid Desc", nl: "Vid Desc" },
    credits: { en: "Vid Credits", nl: "Vid Credits" },
    created_at: "2026-03-28T14:00:00.000Z",
    updated_at: "2026-03-28T14:00:00.000Z",
  };

  const mockCrop: MediaCropDto = {
    id: 1,
    name: "hd_ready",
    url: "https://example.com/crop.jpg",
    created_at: "2026-03-28T14:00:00.000Z",
    updated_at: "2026-03-28T14:00:00.000Z",
  };

  beforeEach(async () => {
    const mockMediaDbService = {
      getAllItems: jest.fn(),
      getItemById: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      getCropsByItem: jest.fn(),
      linkCropToItem: jest.fn(),
      unlinkCropFromItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaItemService,
        {
          provide: MediaDatabaseService,
          useValue: mockMediaDbService,
        },
      ],
    }).compile();

    service = module.get<MediaItemService>(MediaItemService);
    mediaDbService = module.get(MediaDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getItems", () => {
    it("should return a paginated list of items", async () => {
      const paginationFilters: PaginationFilterDto = {
        page: 1,
        limit: 10,
        descending: true,
      };
      const expectedResponse: PaginatedResponse<MediaItemDto> = {
        objects: [mockItem],
        totalItems: 1,
        page: 1,
        limit: 10,
      };

      mediaDbService.getAllItems.mockResolvedValue(expectedResponse);

      const result = await service.getItems(paginationFilters);

      expect(mediaDbService.getAllItems).toHaveBeenCalledWith(
        paginationFilters,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getItemById", () => {
    it("should return a single item", async () => {
      mediaDbService.getItemById.mockResolvedValue(mockItem);

      const result = await service.getItemById(1);

      expect(mediaDbService.getItemById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockItem);
    });
  });

  describe("createItem", () => {
    it("should create an item with gallery_ids", async () => {
      const createItemDto: CreateMediaItemDto = {
        type: "image",
        original_filename: "new.png",
        position: "carousel",
        width: 800,
        height: 600,
        title: { en: "Vid Title", nl: "Vid Title" },
        description: { en: "Vid Desc", nl: "Vid Desc" },
        credits: { en: "Vid Credits", nl: "Vid Credits" },
        gallery_ids: [1, 2],
      };
      mediaDbService.createItem.mockResolvedValue(mockItem);

      const result = await service.createItem(createItemDto);

      expect(mediaDbService.createItem).toHaveBeenCalledWith(
        createItemDto,
        [1, 2],
      );
      expect(result).toEqual(mockItem);
    });

    it("should default to empty array if gallery_ids are missing", async () => {
      const createItemDto: CreateMediaItemDto = {
        type: "image",
        original_filename: "new.png",
        position: "carousel",
        width: 800,
        height: 600,
        title: { en: "Vid Title", nl: "Vid Title" },
        description: { en: "Vid Desc", nl: "Vid Desc" },
        credits: { en: "Vid Credits", nl: "Vid Credits" },
      };
      mediaDbService.createItem.mockResolvedValue(mockItem);

      const result = await service.createItem(createItemDto);

      expect(mediaDbService.createItem).toHaveBeenCalledWith(createItemDto, []);
      expect(result).toEqual(mockItem);
    });
  });

  describe("replaceItem", () => {
    it("should replace and return the item", async () => {
      const replaceItemDto: ReplaceMediaItemDto = {
        type: "video",
        original_filename: "vid.mp4",
        position: "main",
        width: 1920,
        height: 1080,
        title: { en: "Vid Title", nl: "Vid Title" },
        description: { en: "Vid Desc", nl: "Vid Desc" },
        credits: { en: "Vid Credits", nl: "Vid Credits" },
      };
      mediaDbService.updateItem.mockResolvedValue(mockItem);

      const result = await service.replaceItem(1, replaceItemDto);

      expect(mediaDbService.updateItem).toHaveBeenCalledWith(1, replaceItemDto);
      expect(result).toEqual(mockItem);
    });
  });

  describe("modifyItem", () => {
    it("should fetch the existing item, merge modifications, and update", async () => {
      const modifyItemDto: ModifyMediaItemDto = { position: "carousel" };

      const expectedMergedItem: MediaItemDto = {
        ...mockItem,
        ...modifyItemDto,
        id: 1,
      };

      mediaDbService.getItemById.mockResolvedValue(mockItem);
      mediaDbService.updateItem.mockResolvedValue(expectedMergedItem);

      const result = await service.modifyItem(1, modifyItemDto);

      expect(mediaDbService.getItemById).toHaveBeenCalledWith(1);
      expect(mediaDbService.updateItem).toHaveBeenCalledWith(
        1,
        expectedMergedItem,
      );
      expect(result).toEqual(expectedMergedItem);
    });
  });

  describe("deleteItem", () => {
    it("should delete the item", async () => {
      mediaDbService.deleteItem.mockResolvedValue(undefined);

      await service.deleteItem(1);

      expect(mediaDbService.deleteItem).toHaveBeenCalledWith(1);
    });
  });

  describe("getItemCrops", () => {
    it("should return all crops for an item", async () => {
      mediaDbService.getCropsByItem.mockResolvedValue([mockCrop]);

      const result = await service.getItemCrops(1);

      expect(mediaDbService.getCropsByItem).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockCrop]);
    });
  });

  describe("linkCropToItem", () => {
    it("should link a crop to an item", async () => {
      mediaDbService.linkCropToItem.mockResolvedValue(undefined);

      await service.linkCropToItem(1, 2);

      expect(mediaDbService.linkCropToItem).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("unlinkCropFromItem", () => {
    it("should unlink a crop from an item", async () => {
      mediaDbService.unlinkCropFromItem.mockResolvedValue(undefined);

      await service.unlinkCropFromItem(1, 2);

      expect(mediaDbService.unlinkCropFromItem).toHaveBeenCalledWith(1, 2);
    });
  });
});
