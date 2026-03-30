// media.gallery.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { MediaGalleryController } from "./media.gallery.controller";
import { MediaGalleryService } from "../services/media.gallery.service";
import { ApiKeyGuard } from "../../auth/authGuard";
import { PaginatedResponse } from "@repo/common";
import {
  CreateMediaGalleryDto,
  MediaGalleryDto,
  MediaItemDto,
  PaginationFilterDto,
} from "../../dto/dto";

describe("MediaGalleryController", () => {
  let controller: MediaGalleryController;
  let mediaGalleryService: jest.Mocked<MediaGalleryService>;

  const mockGallery: MediaGalleryDto = {
    id: 1,
    created_at: "2026-03-28T14:00:00.000Z",
    updated_at: "2026-03-28T14:00:00.000Z",
  };

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

  beforeEach(async () => {
    const mockMediaGalleryService = {
      getGalleries: jest.fn(),
      getGalleryById: jest.fn(),
      createGallery: jest.fn(),
      deleteGallery: jest.fn(),
      getGalleryItems: jest.fn(),
      linkItemToGallery: jest.fn(),
      unlinkItemFromGallery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaGalleryController],
      providers: [
        {
          provide: MediaGalleryService,
          useValue: mockMediaGalleryService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<MediaGalleryController>(MediaGalleryController);
    mediaGalleryService = module.get(MediaGalleryService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getGalleries", () => {
    it("should return a paginated list of galleries", async () => {
      const paginationFilter: PaginationFilterDto = {
        page: 1,
        limit: 10,
        descending: true,
      };
      const expectedResponse: PaginatedResponse<MediaGalleryDto> = {
        objects: [mockGallery],
        totalItems: 1,
        page: 1,
        limit: 10,
      };

      mediaGalleryService.getGalleries.mockResolvedValue(expectedResponse);

      const result = await controller.getGalleries(paginationFilter);

      expect(mediaGalleryService.getGalleries).toHaveBeenCalledWith(
        paginationFilter,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getGalleryById", () => {
    it("should return a single gallery", async () => {
      mediaGalleryService.getGalleryById.mockResolvedValue(mockGallery);

      const result = await controller.getGalleryById(1);

      expect(mediaGalleryService.getGalleryById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockGallery);
    });
  });

  describe("createGallery", () => {
    it("should create and return a new gallery", async () => {
      const createGalleryDto: CreateMediaGalleryDto = {};
      mediaGalleryService.createGallery.mockResolvedValue(mockGallery);

      const result = await controller.createGallery(createGalleryDto);

      expect(mediaGalleryService.createGallery).toHaveBeenCalledWith(
        createGalleryDto,
      );
      expect(result).toEqual(mockGallery);
    });
  });

  describe("deleteGallery", () => {
    it("should delete the gallery", async () => {
      mediaGalleryService.deleteGallery.mockResolvedValue(undefined);

      await controller.deleteGallery(1);

      expect(mediaGalleryService.deleteGallery).toHaveBeenCalledWith(1);
    });
  });

  describe("getGalleryItems", () => {
    it("should return all items for a gallery", async () => {
      mediaGalleryService.getGalleryItems.mockResolvedValue([mockItem]);

      const result = await controller.getGalleryItems(1);

      expect(mediaGalleryService.getGalleryItems).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockItem]);
    });
  });

  describe("linkItemToGallery", () => {
    it("should link an item to a gallery", async () => {
      mediaGalleryService.linkItemToGallery.mockResolvedValue(undefined);

      await controller.linkItemToGallery(1, 2);

      expect(mediaGalleryService.linkItemToGallery).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("unlinkItemFromGallery", () => {
    it("should unlink an item from a gallery", async () => {
      mediaGalleryService.unlinkItemFromGallery.mockResolvedValue(undefined);

      await controller.unlinkItemFromGallery(1, 2);

      expect(mediaGalleryService.unlinkItemFromGallery).toHaveBeenCalledWith(
        1,
        2,
      );
    });
  });
});
