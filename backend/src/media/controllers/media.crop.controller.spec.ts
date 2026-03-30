// media.crop.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { MediaCropController } from "./media.crop.controller";
import { MediaCropService } from "../services/media.crop.service";
import { PaginatedResponse } from "@repo/common";
import {
  CreateMediaCropDto,
  MediaCropDto,
  ModifyMediaCropDto,
  ReplaceMediaCropDto,
  PaginationFilterDto,
} from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";

describe("MediaCropController", () => {
  let controller: MediaCropController;
  let mediaCropService: jest.Mocked<MediaCropService>;

  const mockCrop: MediaCropDto = {
    id: 1,
    name: "hd_ready",
    url: "https://example.com/crop.jpg",
    created_at: "2026-03-28T14:00:00.000Z",
    updated_at: "2026-03-28T14:00:00.000Z",
  };

  beforeEach(async () => {
    const mockMediaCropService = {
      getCrops: jest.fn(),
      getCropById: jest.fn(),
      createCrop: jest.fn(),
      replaceCrop: jest.fn(),
      modifyCrop: jest.fn(),
      deleteCrop: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaCropController],
      providers: [
        {
          provide: MediaCropService,
          useValue: mockMediaCropService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<MediaCropController>(MediaCropController);
    mediaCropService = module.get(MediaCropService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
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

      mediaCropService.getCrops.mockResolvedValue(expectedResponse);

      const result = await controller.getCrops(paginationFilters);

      expect(mediaCropService.getCrops).toHaveBeenCalledWith(paginationFilters);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getCropById", () => {
    it("should return a single crop", async () => {
      mediaCropService.getCropById.mockResolvedValue(mockCrop);

      const result = await controller.getCropById(1);

      expect(mediaCropService.getCropById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCrop);
    });
  });

  describe("createCrop", () => {
    it("should create and return a new crop", async () => {
      const createCropDto: CreateMediaCropDto = {
        name: "FE3_header",
        url: "https://example.com/header.jpg",
        item_id: 12,
      };
      mediaCropService.createCrop.mockResolvedValue(mockCrop);

      const result = await controller.createCrop(createCropDto);

      expect(mediaCropService.createCrop).toHaveBeenCalledWith(createCropDto);
      expect(result).toEqual(mockCrop);
    });
  });

  describe("replaceCrop", () => {
    it("should replace and return the crop", async () => {
      const replaceCropDto: ReplaceMediaCropDto = {
        name: "og_image",
        url: "https://example.com/og.jpg",
      };
      mediaCropService.replaceCrop.mockResolvedValue(mockCrop);

      const result = await controller.replaceCrop(1, replaceCropDto);

      expect(mediaCropService.replaceCrop).toHaveBeenCalledWith(
        1,
        replaceCropDto,
      );
      expect(result).toEqual(mockCrop);
    });
  });

  describe("modifyCrop", () => {
    it("should modify and return the crop", async () => {
      const modifyCropDto: ModifyMediaCropDto = {
        url: "https://example.com/patched.jpg",
      };
      mediaCropService.modifyCrop.mockResolvedValue(mockCrop);

      const result = await controller.modifyCrop(1, modifyCropDto);

      expect(mediaCropService.modifyCrop).toHaveBeenCalledWith(
        1,
        modifyCropDto,
      );
      expect(result).toEqual(mockCrop);
    });
  });

  describe("deleteCrop", () => {
    it("should delete the crop", async () => {
      mediaCropService.deleteCrop.mockResolvedValue(undefined);

      await controller.deleteCrop(1);

      expect(mediaCropService.deleteCrop).toHaveBeenCalledWith(1);
    });
  });
});
