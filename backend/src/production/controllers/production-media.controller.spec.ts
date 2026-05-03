import { Test, TestingModule } from "@nestjs/testing";
import { ProductionMediaController } from "./production-media.controller";
import { ProductionService } from "../production.service";
import { MediaGalleryDto } from "../../dto/dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ApiKeyGuard } from "../../auth/authGuard";
import { GalleryType } from "@repo/common";

describe("ProductionMediaController", () => {
  let controller: ProductionMediaController;
  let service: ProductionService;

  const mockMediaGallery: MediaGalleryDto = {
    id: 1,
    name: "Production Main Gallery",
    type: "default",
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  } as unknown as MediaGalleryDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionMediaController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getProductionMedia: jest.fn(),
            linkMediaToProduction: jest.fn(),
            unlinkMediaFromProduction: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<ProductionMediaController>(
      ProductionMediaController,
    );
    service = module.get<ProductionService>(ProductionService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getMedia", () => {
    it("should return the media gallery linked to the production", async () => {
      const type: GalleryType = "default";
      jest
        .spyOn(service, "getProductionMedia")
        .mockResolvedValueOnce(mockMediaGallery);

      const result = await controller.getMedia(1, type);

      expect(service.getProductionMedia).toHaveBeenCalledWith(1, type);
      expect(result).toEqual(mockMediaGallery);
    });

    it("should throw NotFoundException if no gallery is found", async () => {
      const type: GalleryType = "default";
      jest
        .spyOn(service, "getProductionMedia")
        .mockRejectedValueOnce(new NotFoundException());

      await expect(controller.getMedia(999, type)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("linkMedia", () => {
    it("should link media to the production successfully", async () => {
      jest
        .spyOn(service, "linkMediaToProduction")
        .mockResolvedValueOnce(undefined);
      await expect(controller.linkMedia(1, 2)).resolves.not.toThrow();
      expect(service.linkMediaToProduction).toHaveBeenCalledWith(1, 2);
    });

    it("should pass through errors when linking fails", async () => {
      jest
        .spyOn(service, "linkMediaToProduction")
        .mockRejectedValueOnce(new BadRequestException("Already linked"));
      await expect(controller.linkMedia(1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("unlinkMedia", () => {
    it("should unlink a media from a production successfully", async () => {
      jest
        .spyOn(service, "unlinkMediaFromProduction")
        .mockRejectedValueOnce(new NotFoundException("Link not found"));
      await expect(controller.unlinkMedia(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
