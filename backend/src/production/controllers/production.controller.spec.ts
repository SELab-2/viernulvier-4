import { Test, TestingModule } from "@nestjs/testing";
import { ProductionController } from "./production.controller";
import { ProductionService } from "../production.service";
import {
  CreateProductionDto,
  ProductionDto,
  UpdateProductionDto,
} from "../../dto/dto";
import { ApiKeyGuard, SuperApiKeyGuard } from "../../auth/authGuard";
import { FilterProductionSchema } from "@repo/common";
import { ResourceGoneException } from "../../common/exceptions";

describe("ProductionController", () => {
  let controller: ProductionController;
  let service: ProductionService;

  const mockProduction: ProductionDto = {
    id: 1,
    titel: "The Great Show",
    ondertitel: "A masterpiece",
    description1: "An amazing production",
    description2: "With great actors",
    planning_id: "1",
  };

  const mockProductions: ProductionDto[] = [mockProduction];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getAllProductions: jest.fn().mockResolvedValue(mockProductions),
            getProductionById: jest.fn().mockResolvedValue(mockProduction),
            replaceProduction: jest.fn().mockResolvedValue(mockProduction),
            modifyProduction: jest.fn().mockResolvedValue(mockProduction),
            deleteProduction: jest.fn().mockResolvedValue(undefined),
            createProduction: jest.fn(),
            upsertProduction: jest.fn(),
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

    controller = module.get<ProductionController>(ProductionController);
    service = module.get<ProductionService>(ProductionService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllProductions", () => {
    it("should return an array of productions", async () => {
      const result = await controller.getAllProductions(
        FilterProductionSchema.parse({}),
      );
      expect(result).toEqual(mockProductions);
      expect(service.getAllProductions).toHaveBeenCalled();
    });

    it("should call service.getAllProductions", async () => {
      await controller.getAllProductions(FilterProductionSchema.parse({}));
      expect(service.getAllProductions).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no productions exist", async () => {
      jest.spyOn(service, "getAllProductions").mockResolvedValueOnce([]);
      const result = await controller.getAllProductions(
        FilterProductionSchema.parse({}),
      );
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return a single production by id", async () => {
      const result = await controller.getProductionById(1);
      expect(result).toEqual(mockProduction);
      expect(service.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should call service.getProductionById with correct id", async () => {
      await controller.getProductionById(1);
      expect(service.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should handle different production ids", async () => {
      const production2 = { ...mockProduction, id: 2 };
      jest
        .spyOn(service, "getProductionById")
        .mockResolvedValueOnce(production2);
      const result = await controller.getProductionById(2);
      expect(result.id).toBe(2);
      expect(service.getProductionById).toHaveBeenCalledWith(2);
    });

    it("should throw a ResourceGoneException (410) if the production does not exist", async () => {
      jest
        .spyOn(service, "getProductionById")
        .mockRejectedValue(new ResourceGoneException("Production not found"));
      await expect(controller.getProductionById(999)).rejects.toThrow(
        ResourceGoneException,
      );
    });
  });

  describe("replaceProduction", () => {
    it("should replace and return the production", async () => {
      const result = await controller.replaceProduction(1, mockProduction);
      expect(service.replaceProduction).toHaveBeenCalledWith(1, mockProduction);
      expect(result).toEqual(mockProduction);
    });

    it("should throw a ResourceGoneException (410) if trying to replace a non-existent production", async () => {
      jest
        .spyOn(service, "replaceProduction")
        .mockRejectedValue(new ResourceGoneException("Production not found"));
      await expect(
        controller.replaceProduction(999, mockProduction),
      ).rejects.toThrow(ResourceGoneException);
    });
  });

  describe("modifyProduction", () => {
    it("should modify and return the production", async () => {
      const patchData: UpdateProductionDto = { titel: "A New titel" };
      const patchedProduction = { ...mockProduction, titel: "A New titel" };

      jest
        .spyOn(service, "modifyProduction")
        .mockResolvedValueOnce(patchedProduction);

      const result = await controller.modifyProduction(1, patchData);
      expect(service.modifyProduction).toHaveBeenCalledWith(1, patchData);
      expect(result).toEqual(patchedProduction);
    });

    it("should throw a ResourceGoneException (410) if trying to modify a non-existent production", async () => {
      const patchData: UpdateProductionDto = { titel: "A New titel" };
      jest
        .spyOn(service, "modifyProduction")
        .mockRejectedValueOnce(new ResourceGoneException("Production not found"));
      await expect(controller.modifyProduction(999, patchData)).rejects.toThrow(
        ResourceGoneException,
      );
    });
  });

  describe("deleteProduction", () => {
    it("should delete the production by id", async () => {
      const result = await controller.deleteProduction(1);
      expect(service.deleteProduction).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it("should throw a ResourceGoneException (410) if trying to delete a non-existent production", async () => {
      jest
        .spyOn(service, "deleteProduction")
        .mockRejectedValue(new ResourceGoneException("Production not found"));
      await expect(controller.deleteProduction(999)).rejects.toThrow(
        ResourceGoneException,
      );
    });
  });

  describe("createProduction", () => {
    it("should create a production successfully", async () => {
      const newProduction: CreateProductionDto = {
        titel: "New Show",
        ondertitel: "Exciting",
        description1: "Awesome description",
        description2: "Even more awesome",
        planning_id: "2",
      };

      const createdProduction: ProductionDto = { id: 2, ...newProduction };

      jest
        .spyOn(service, "createProduction")
        .mockResolvedValueOnce(createdProduction);

      const result = await controller.createProduction(newProduction);

      expect(service.createProduction).toHaveBeenCalledWith(newProduction);
      expect(result).toEqual(createdProduction);
    });

    it("should handle database errors when creation fails", async () => {
      const newProduction: CreateProductionDto = {
        titel: "New Show",
        ondertitel: "Exciting",
        description1: "Awesome description",
        description2: "Even more awesome",
        planning_id: "2",
      };

      jest
        .spyOn(service, "createProduction")
        .mockRejectedValueOnce(new Error("Failed to create production"));

      await expect(controller.createProduction(newProduction)).rejects.toThrow(
        "Failed to create production",
      );
    });
  });
});
