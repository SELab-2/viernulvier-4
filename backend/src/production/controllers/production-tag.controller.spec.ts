import { Test, TestingModule } from "@nestjs/testing";
import { ProductionTagController } from "./production-tag.controller";
import { ProductionService } from "../production.service";
import { ProductionDto, TagDto } from "../../dto/dto";
import { NotFoundException } from "@nestjs/common";

describe("ProductionTagController", () => {
  let controller: ProductionTagController;
  let service: ProductionService;

  const mockProduction: ProductionDto = {
    id: 1,
    titel: "The Great Show",
    ondertitel: "A masterpiece",
    description1: "An amazing production",
    description2: "With great actors",
    planning_id: "1",
  };

  const mockTags: TagDto[] = [
    {
      id: 1,
      tag: "Drama",
    },
    {
      id: 2,
      tag: "Classical",
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionTagController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getTagsById: jest.fn().mockResolvedValue(mockTags),
            addTagToProduction: jest.fn(),
            removeTagFromProduction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductionTagController>(ProductionTagController);
    service = module.get<ProductionService>(ProductionService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getTagsOfProductionByID", () => {
    it("should return tags for a production", async () => {
      const result = await controller.getTagsOfProductionByID(1);
      expect(result).toEqual(mockTags);
      expect(service.getTagsById).toHaveBeenCalledWith(1);
    });

    it("should call service.getTagsById with the correct production id", async () => {
      await controller.getTagsOfProductionByID(1);
      expect(service.getTagsById).toHaveBeenCalledWith(1);
      expect(service.getTagsById).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when production has no tags", async () => {
      jest.spyOn(service, "getTagsById").mockResolvedValueOnce([]);
      const result = await controller.getTagsOfProductionByID(1);
      expect(result).toEqual([]);
    });

    it("should handle different production ids", async () => {
      await controller.getTagsOfProductionByID(2);
      expect(service.getTagsById).toHaveBeenCalledWith(2);
    });

    it("should throw a NotFoundException if the production does not exist", async () => {
      jest
        .spyOn(service, "getTagsById")
        .mockRejectedValueOnce(
          new NotFoundException("ProductionDto not found"),
        );

      await expect(controller.getTagsOfProductionByID(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should handle database errors when fetching tags fails", async () => {
      jest
        .spyOn(service, "getTagsById")
        .mockRejectedValueOnce(new Error("Failed to fetch tags"));

      await expect(controller.getTagsOfProductionByID(1)).rejects.toThrow(
        "Failed to fetch tags",
      );
    });
  });

  describe("addTagToProduction", () => {
    it("should add a tag to a production and return the production", async () => {
      jest
        .spyOn(service, "addTagToProduction")
        .mockResolvedValueOnce(mockProduction);

      const result = await controller.addTagToProduction(1, 2);

      expect(service.addTagToProduction).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockProduction);
    });

    it("should pass through errors if adding a tag fails (e.g., production not found)", async () => {
      jest
        .spyOn(service, "addTagToProduction")
        .mockRejectedValueOnce(
          new NotFoundException("ProductionDto not found"),
        );

      await expect(controller.addTagToProduction(999, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("removeTagFromProduction", () => {
    it("should remove a tag from a production and return the production", async () => {
      jest
        .spyOn(service, "removeTagFromProduction")
        .mockResolvedValueOnce(mockProduction);

      const result = await controller.removeTagFromProduction(1, 2);

      expect(service.removeTagFromProduction).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockProduction);
    });

    it("should pass through errors if removing a tag fails (e.g., production not found)", async () => {
      jest
        .spyOn(service, "removeTagFromProduction")
        .mockRejectedValueOnce(
          new NotFoundException("ProductionDto not found"),
        );

      await expect(controller.removeTagFromProduction(999, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
