import { Test, TestingModule } from "@nestjs/testing";
import { ProductionController } from "./production.controller";
import { ProductionService } from "./production.service";
import type { Production } from "@repo/common";

describe("ProductionController", () => {
  let controller: ProductionController;
  let service: ProductionService;

  const mockProduction: Production = {
    id: 1,
    titel: "The Great Show",
    ondertitel: "A masterpiece",
    description1: "An amazing production",
    description2: "With great actors",
    genre: "Drama",
    planning_id: 1,
  };

  const mockProductions: Production[] = [mockProduction];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getAllProductions: jest.fn().mockResolvedValue(mockProductions),
            getProductionById: jest.fn().mockResolvedValue(mockProduction),
            updateProduction: jest.fn().mockResolvedValue({}),
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
  });
});
