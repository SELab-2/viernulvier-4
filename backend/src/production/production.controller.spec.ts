import { Test, TestingModule } from "@nestjs/testing";
import { ProductionController } from "./production.controller";
import { ProductionService } from "./production.service";
import { ProductionDto, UpdateProductionDto } from "../dto/dto"; 
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("ProductionController", () => {
  let controller: ProductionController;
  let service: ProductionService;

  const mockProduction: ProductionDto = {
    id: 1,
    titel: "The Great Show",
    ondertitel: "A masterpiece",
    description1: "An amazing production",
    description2: "With great actors",
    genre: "Drama",
    planning_id: 1,
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
          },
        },
      ],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
    service = module.get<ProductionService>(ProductionService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllProductions", () => {
    it("should return an array of productions", async () => {
      const result = await controller.getAllProductions();
      expect(result).toEqual(mockProductions);
      expect(service.getAllProductions).toHaveBeenCalled();
    });

    it("should call service.getAllProductions", async () => {
      await controller.getAllProductions();
      expect(service.getAllProductions).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no productions exist", async () => {
      jest.spyOn(service, "getAllProductions").mockResolvedValueOnce([]);
      const result = await controller.getAllProductions();
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return a single production by id", async () => {
      const result = await controller.getById(1);
      expect(result).toEqual(mockProduction);
      expect(service.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should call service.getProductionById with correct id", async () => {
      await controller.getById(1);
      expect(service.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should handle different production ids", async () => {
      const production2 = { ...mockProduction, id: 2 };
      jest
        .spyOn(service, "getProductionById")
        .mockResolvedValueOnce(production2);
      const result = await controller.getById(2);
      expect(result.id).toBe(2);
      expect(service.getProductionById).toHaveBeenCalledWith(2);
    });

    it("should throw a NotFoundException if the production does not exist", async () => {
      // Simulate the service not finding the ID in the database
      jest.spyOn(service, "getProductionById").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));
    
      // Verify the controller passes the exact same exception up
      await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("replaceProduction", () => {
    it("should replace and return the production", async () => {
      const result = await controller.replaceProduction(1, mockProduction);
      expect(service.replaceProduction).toHaveBeenCalledWith(1, mockProduction);
      expect(result).toEqual(mockProduction);
    });

    it("should throw a NotFoundException if trying to replace a non-existent production", async () => {
      jest.spyOn(service, "replaceProduction").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));
    
      await expect(controller.replaceProduction(999, mockProduction)).rejects.toThrow(NotFoundException);
    });
  });

  describe("modifyProduction", () => {
    it("should modify and return the production", async () => {
      const patchData: UpdateProductionDto = { titel: "A New Title" };
      const patchedProduction = { ...mockProduction, titel: "A New Title" };
      
      jest.spyOn(service, "modifyProduction").mockResolvedValueOnce(patchedProduction);
      
      const result = await controller.modifyProduction(1, patchData);
      expect(service.modifyProduction).toHaveBeenCalledWith(1, patchData);
      expect(result).toEqual(patchedProduction);
    });

    it("should throw a NotFoundException if trying to modify a non-existent production", async () => {
      const patchData: UpdateProductionDto = { titel: "A New Title" };
      
      jest.spyOn(service, "modifyProduction").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));
    
      await expect(controller.modifyProduction(999, patchData)).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteProduction", () => {
    it("should delete the production by id", async () => {
      const result = await controller.deleteProduction(1);
      expect(service.deleteProduction).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it("should throw a NotFoundException if trying to delete a non-existent production", async () => {
      jest.spyOn(service, "deleteProduction").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));
    
      await expect(controller.deleteProduction(999)).rejects.toThrow(NotFoundException);
    });
  });

  // TODO: Missing createProduction test
});
