import { Test, TestingModule } from "@nestjs/testing";
import { BlogMediaController } from "./blog-media.controller";
import { BlogService } from "../blog.service";
import { MediaGalleryDto } from "../../dto/dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ApiKeyGuard } from "../../auth/authGuard";
import { GalleryType } from "@repo/common";

describe("BlogMediaController", () => {
  let controller: BlogMediaController;
  let service: BlogService;

  const mockMediaGallery: MediaGalleryDto = {
    id: 1,
    name: "Blog Header Gallery",
    type: "default",
    created_at: "2026-05-12T10:00:00Z",
    updated_at: "2026-05-12T10:00:00Z",
  } as unknown as MediaGalleryDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogMediaController],
      providers: [
        {
          provide: BlogService,
          useValue: {
            getMedia: jest.fn(),
            linkMediaToBlog: jest.fn(),
            unlinkMediaFromBlog: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();
    controller = module.get<BlogMediaController>(BlogMediaController);
    service = module.get<BlogService>(BlogService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getMedia", () => {
    it("should return the media gallery linked to a blog", async () => {
      const type: GalleryType = "default";
      jest.spyOn(service, "getMedia").mockResolvedValueOnce(mockMediaGallery);
      const result = await controller.getMedia(1, type);
      expect(service.getMedia).toHaveBeenCalledWith(1, type);
      expect(result).toEqual(mockMediaGallery);
    });

    it("should throw a NotFoundException if no gallery is found", async () => {
      const type: GalleryType = "default";
      jest
        .spyOn(service, "getMedia")
        .mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getMedia(999, type)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("linkMedia", () => {
    it("should link a media gallery to a blog successfully", async () => {
      jest.spyOn(service, "linkMediaToBlog").mockResolvedValueOnce(undefined);
      await expect(controller.linkMedia(1, 2)).resolves.not.toThrow();
      expect(service.linkMediaToBlog).toHaveBeenCalledWith(1, 2);
    });

    it("should pass through errors when linking fails", async () => {
      jest
        .spyOn(service, "linkMediaToBlog")
        .mockRejectedValueOnce(new BadRequestException());
      await expect(controller.linkMedia(1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("unlinkMedia", () => {
    it("should unlink a media gallery from a blog successfully", async () => {
      jest
        .spyOn(service, "unlinkMediaFromBlog")
        .mockResolvedValueOnce(undefined);
      await expect(controller.unlinkMedia(1, 2)).resolves.not.toThrow();
      expect(service.unlinkMediaFromBlog).toHaveBeenCalledWith(1, 2);
    });

    it("should pass through errors when unlinking fails", async () => {
      jest
        .spyOn(service, "unlinkMediaFromBlog")
        .mockRejectedValueOnce(new NotFoundException());
      await expect(controller.unlinkMedia(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
