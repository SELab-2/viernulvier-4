import { Test, TestingModule } from "@nestjs/testing";
import { ProductionService } from "./production.service";
import { ProductionDatabaseService } from "../database/db.production.service";
import type { Production, CreateProduction, UpdateProduction } from "@repo/common";
import { BadRequestException } from "@nestjs/common";

describe("ProductionService", () => {
  let service: ProductionService;
  let dbService: ProductionDatabaseService;

  const mockProduction: Production = {
    id: 1,
    titel: "The Great Show",
    ondertitel: "A masterpiece",
    description1: "An amazing production",
    description2: "With great actors",
    genre: "Drama",
    planning_id: 1,
    blog_titel: "Blog title",
    blog_text: "Blog content",
  };

  const mockProductions: Production[] = [mockProduction];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: ProductionDatabaseService,
          useValue: {
            getProductions: jest.fn().mockResolvedValue(mockProductions),
            getProductionById: jest.fn().mockResolvedValue(mockProduction),
            updateProduction: jest.fn().mockResolvedValue(mockProduction),
            deleteProduction: jest.fn().mockResolvedValue(mockProduction),
          },
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    dbService = module.get<ProductionDatabaseService>(ProductionDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAllProductions", () => {
    it("should return all productions from database", async () => {
      const result = await service.getAllProductions();
      expect(result).toEqual(mockProductions);
      expect(dbService.getProductions).toHaveBeenCalledWith({});
    });

    it("should call dbService.getProductions with empty filter", async () => {
      await service.getAllProductions();
      expect(dbService.getProductions).toHaveBeenCalledWith({});
      expect(dbService.getProductions).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no productions exist", async () => {
      jest.spyOn(dbService, "getProductions").mockResolvedValueOnce([]);
      const result = await service.getAllProductions();
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      jest
        .spyOn(dbService, "getProductions")
        .mockRejectedValueOnce(new Error("Database error"));
      await expect(service.getAllProductions()).rejects.toThrow("Database error");
    });
  });

  describe("getProductionById", () => {
    it("should return production by id from database", async () => {
      const result = await service.getProductionById(1);
      expect(result).toEqual(mockProduction);
      expect(dbService.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should call dbService.getProductionById with correct id", async () => {
      await service.getProductionById(1);
      expect(dbService.getProductionById).toHaveBeenCalledWith(1);
      expect(dbService.getProductionById).toHaveBeenCalledTimes(1);
    });

    it("should handle different production ids", async () => {
      const production2 = { ...mockProduction, id: 2 };
      jest.spyOn(dbService, "getProductionById").mockResolvedValueOnce(production2);
      const result = await service.getProductionById(2);
      expect(result.id).toBe(2);
      expect(dbService.getProductionById).toHaveBeenCalledWith(2);
    });

    it("should handle database error when production not found", async () => {
      jest
        .spyOn(dbService, "getProductionById")
        .mockRejectedValueOnce(new Error("No Production exists for provided ID"));
      await expect(service.getProductionById(999)).rejects.toThrow(
        "No Production exists for provided ID"
      );
    });
  });

  describe("replaceProduction", () => {
    it("should successfully replace and return the production", async () => {
      const result = await service.replaceProduction(1, mockProduction);
      expect(dbService.updateProduction).toHaveBeenCalledWith(1, mockProduction);
      expect(result).toEqual(mockProduction);
    });

    it("should throw BadRequestException if url id and body id do not match", async () => {
      await expect(service.replaceProduction(2, mockProduction)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.replaceProduction(2, mockProduction)).rejects.toThrow(
        "ID in the URL must match ID in the body."
      );
    });
  });

  describe("modifyProduction", () => {
    it("should fetch, merge, update, and return the modified production", async () => {
      const patchData: UpdateProduction = { titel: "Patched Title" };
      const expectedMergedProduction = { ...mockProduction, ...patchData, id: 1 };
      
      jest.spyOn(dbService, "updateProduction").mockResolvedValueOnce(expectedMergedProduction);

      const result = await service.modifyProduction(1, patchData);

      expect(dbService.getProductionById).toHaveBeenCalledWith(1);
      expect(dbService.updateProduction).toHaveBeenCalledWith(1, expectedMergedProduction);
      expect(result).toEqual(expectedMergedProduction);
    });
  });

  describe("deleteProduction", () => {
    it("should delete the production by id and return nothing", async () => {
      const result = await service.deleteProduction(1);
      expect(dbService.deleteProduction).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  // TODO: Missing createProduction test
});
