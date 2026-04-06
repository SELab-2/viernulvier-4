// media.gallery.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { MediaGalleryService } from "./media.gallery.service";
import { MediaGalleryDatabaseService } from "../../database/media/db.media_gallery.service";
import { PaginatedResponse } from "@repo/common";
import {
  CreateMediaGalleryDto,
  MediaGalleryDto,
  MediaItemDto,
  PaginationFilterDto,
} from "../../dto/dto";

describe("MediaGalleryService", () => {
  let service: MediaGalleryService;
  let mediaDbService: jest.Mocked<MediaGalleryDatabaseService>;

  const mockGallery: MediaGalleryDto = {
    id: 1,
    name: "hi",
    type: "default",
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
    const mockMediaDbService = {
      getGalleries: jest.fn(),
      getGalleryById: jest.fn(),
      createGallery: jest.fn(),
      deleteGallery: jest.fn(),
      getItemsByGallery: jest.fn(),
      linkItemToGallery: jest.fn(),
      unlinkItemFromGallery: jest.fn(),
      linkPrintItemToGallery: jest.fn(),
      unlinkPrintItemFromGallery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaGalleryService,
        {
          provide: MediaGalleryDatabaseService,
          useValue: mockMediaDbService,
        },
      ],
    }).compile();

    service = module.get<MediaGalleryService>(MediaGalleryService);
    mediaDbService = module.get(MediaGalleryDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
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

      mediaDbService.getGalleries.mockResolvedValue(expectedResponse);

      const result = await service.getGalleries(paginationFilter);

      // Note: The service unpacks the DTO properties to pass to the DB service
      expect(mediaDbService.getGalleries).toHaveBeenCalledWith(
        paginationFilter.limit,
        paginationFilter.page,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getGalleryById", () => {
    it("should return a single gallery", async () => {
      mediaDbService.getGalleryById.mockResolvedValue(mockGallery);

      const result = await service.getGalleryById(1);

      expect(mediaDbService.getGalleryById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockGallery);
    });
  });

  describe("createGallery", () => {
    it("should create and return a new gallery", async () => {
      const createGalleryDto: CreateMediaGalleryDto = {
        name: "hi",
        type: "default",
      };
      mediaDbService.createGallery.mockResolvedValue(mockGallery);

      const result = await service.createGallery(createGalleryDto);

      expect(mediaDbService.createGallery).toHaveBeenCalledWith(
        createGalleryDto,
      );
      expect(result).toEqual(mockGallery);
    });
  });

  describe("deleteGallery", () => {
    it("should delete the gallery", async () => {
      mediaDbService.deleteGallery.mockResolvedValue(undefined);

      await service.deleteGallery(1);

      expect(mediaDbService.deleteGallery).toHaveBeenCalledWith(1);
    });
  });

  describe("getGalleryItems", () => {
    it("should return all items for a gallery", async () => {
      mediaDbService.getItemsByGallery.mockResolvedValue([mockItem]);

      const result = await service.getGalleryItems(1);

      expect(mediaDbService.getItemsByGallery).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockItem]);
    });
  });

  describe("linkItemToGallery", () => {
    it("should link an item to a gallery", async () => {
      mediaDbService.linkItemToGallery.mockResolvedValue(undefined);

      await service.linkItemToGallery(1, 2);

      expect(mediaDbService.linkItemToGallery).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("unlinkItemFromGallery", () => {
    it("should unlink an item from a gallery", async () => {
      mediaDbService.unlinkItemFromGallery.mockResolvedValue(undefined);

      await service.unlinkItemFromGallery(1, 2);

      expect(mediaDbService.unlinkItemFromGallery).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("linkPrintItemToGallery", () => {
    it("should link a print item to a gallery", async () => {
      mediaDbService.linkPrintItemToGallery.mockResolvedValue(undefined);

      // Let op: service parameters zijn (printItemId, galleryId)
      // DbService parameters zijn (galleryId, printItemId)
      await service.linkPrintItemToGallery(1, 2);

      expect(mediaDbService.linkPrintItemToGallery).toHaveBeenCalledWith(2, 1);
    });
  });

  describe("unlinkPrintItemFromGallery", () => {
    it("should unlink a print item from a gallery", async () => {
      mediaDbService.unlinkPrintItemFromGallery.mockResolvedValue(undefined);

      await service.unlinkPrintItemFromGallery(1, 2);

      expect(mediaDbService.unlinkPrintItemFromGallery).toHaveBeenCalledWith(
        2,
        1,
      );
    });
  });
});
