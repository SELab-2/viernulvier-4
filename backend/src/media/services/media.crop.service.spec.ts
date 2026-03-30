// media.crop.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { MediaCropService } from "./media.crop.service";
import { MediaDatabaseService } from "../../database/db.media.service";
import { PaginatedResponse } from "@repo/common";
import {
  CreateMediaCropDto,
  MediaCropDto,
  ModifyMediaCropDto,
  ReplaceMediaCropDto,
  PaginationFilterDto,
} from "../../dto/dto";

describe("MediaCropService", () => {
  let service: MediaCropService;
  let mediaDbService: jest.Mocked<MediaDatabaseService>;

  const mockCrop: MediaCropDto = {
    id: 1,
    name: "hd_ready",
    url: "https://example.com/crop.jpg",
    created_at: "2026-03-28T14:00:00.000Z",
    updated_at: "2026-03-28T14:00:00.000Z",
  };

  beforeEach(async () => {
    const mockMediaDbService = {
      getAllCrops: jest.fn(),
      getCropById: jest.fn(),
      createCrop: jest.fn(),
      updateCrop: jest.fn(),
      deleteCrop: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaCropService,
        {
          provide: MediaDatabaseService,
          useValue: mockMediaDbService,
        },
      ],
    }).compile();

    service = module.get<MediaCropService>(MediaCropService);
    mediaDbService = module.get(MediaDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getCrops", () => {
    it("should return a paginated list of crops", async () => {
      const paginationFilters: PaginationFilterDto = {
        page: 1,
        limit: 10,
        descending: true,
      };
      const expectedResponse: PaginatedResponse<MediaCropDto> = {
        objects: [mockCrop],
        totalItems: 1,
        page: 1,
        limit: 10,
      };

      mediaDbService.getAllCrops.mockResolvedValue(expectedResponse);

      const result = await service.getCrops(paginationFilters);

      expect(mediaDbService.getAllCrops).toHaveBeenCalledWith(
        paginationFilters,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getCropById", () => {
    it("should return a single crop", async () => {
      mediaDbService.getCropById.mockResolvedValue(mockCrop);

      const result = await service.getCropById(1);

      expect(mediaDbService.getCropById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCrop);
    });
  });

  describe("createCrop", () => {
    it("should create and return a new crop", async () => {
      const createCropDto: CreateMediaCropDto = {
        name: "thumbnail",
        url: "https://example.com/thumb.jpg",
        item_id: 42,
      };
      mediaDbService.createCrop.mockResolvedValue(mockCrop);

      const result = await service.createCrop(createCropDto);

      expect(mediaDbService.createCrop).toHaveBeenCalledWith(createCropDto);
      expect(result).toEqual(mockCrop);
    });
  });

  describe("replaceCrop", () => {
    it("should replace and return the crop", async () => {
      const replaceCropDto: ReplaceMediaCropDto = {
        name: "mobile",
        url: "https://example.com/mobile.jpg",
      };
      mediaDbService.updateCrop.mockResolvedValue(mockCrop);

      const result = await service.replaceCrop(1, replaceCropDto);

      expect(mediaDbService.updateCrop).toHaveBeenCalledWith(1, replaceCropDto);
      expect(result).toEqual(mockCrop);
    });
  });

  describe("modifyCrop", () => {
    it("should fetch the existing crop, merge modifications, and update", async () => {
      const existingCrop: MediaCropDto = {
        id: 1,
        name: "hd_ready",
        url: "https://example.com/old.jpg",
        created_at: "2026-03-28T14:00:00.000Z",
        updated_at: "2026-03-28T14:00:00.000Z",
      };

      const modifyCropDto: ModifyMediaCropDto = {
        url: "https://example.com/new.jpg",
      };

      const expectedMergedCrop: MediaCropDto = {
        ...existingCrop,
        ...modifyCropDto,
        id: 1,
      };

      mediaDbService.getCropById.mockResolvedValue(existingCrop);
      mediaDbService.updateCrop.mockResolvedValue(expectedMergedCrop);

      const result = await service.modifyCrop(1, modifyCropDto);

      expect(mediaDbService.getCropById).toHaveBeenCalledWith(1);
      expect(mediaDbService.updateCrop).toHaveBeenCalledWith(
        1,
        expectedMergedCrop,
      );
      expect(result).toEqual(expectedMergedCrop);
    });
  });

  describe("deleteCrop", () => {
    it("should delete the crop", async () => {
      mediaDbService.deleteCrop.mockResolvedValue(undefined);

      await service.deleteCrop(1);

      expect(mediaDbService.deleteCrop).toHaveBeenCalledWith(1);
    });
  });
});
