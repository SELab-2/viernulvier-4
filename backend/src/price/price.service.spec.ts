import { Test, TestingModule } from "@nestjs/testing";
import { PriceService } from "./price.service";
import { PriceDatabaseService } from "../database/db.price.service";
import {
  CreatePriceDto,
  PaginationFilterDto,
  PriceDto,
  ModifyPriceDto,
  ReplacePriceDto,
} from "../dto/dto";
import { ApiKeyGuard } from "../auth/authGuard";

describe("PriceService", () => {
  let service: PriceService;
  let dbService: PriceDatabaseService;

  // Mock the database service
  const mockPriceDatabaseService = {
    getPriceById: jest.fn(),
    getPrices: jest.fn(),
    createPrice: jest.fn(),
    updatePrice: jest.fn(),
    deletePrice: jest.fn(),
  };

  // Updated to match PriceSchema
  const mockPrice: PriceDto = {
    id: 1,
    price: 20.0,
    name: {
      en: "Standard",
      nl: "Standaard",
    },
    created_at: "2024-01-15T19:00:00Z",
    updated_at: "2024-01-15T19:00:00Z",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceService,
        {
          provide: PriceDatabaseService,
          useValue: mockPriceDatabaseService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    service = module.get<PriceService>(PriceService);
    dbService = module.get<PriceDatabaseService>(PriceDatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPriceById", () => {
    it("should call getPriceById on the db service and return a price", async () => {
      mockPriceDatabaseService.getPriceById.mockResolvedValue(mockPrice);

      const result = await service.getPriceById(1);

      expect(dbService.getPriceById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPrice);
    });
  });

  describe("getPrices", () => {
    it("should unpack pagination filter and call getPrices on the db service", async () => {
      const filter: PaginationFilterDto = {
        limit: 10,
        page: 1,
      };
      const expectedPrices = [mockPrice];
      mockPriceDatabaseService.getPrices.mockResolvedValue(expectedPrices);

      const result = await service.getPrices(filter);

      // Verify that the service correctly passes the individual limit and page properties
      expect(dbService.getPrices).toHaveBeenCalledWith(filter);
      expect(result).toEqual(expectedPrices);
    });
  });

  describe("createPrice", () => {
    it("should call createPrice on the db service and return the new price", async () => {
      const createDto: CreatePriceDto = {
        price: 20.0,
        name: { en: "Standard", nl: "Standaard" },
      };
      mockPriceDatabaseService.createPrice.mockResolvedValue(mockPrice);

      const result = await service.createPrice(createDto);

      expect(dbService.createPrice).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPrice);
    });
  });

  describe("replacePrice", () => {
    it("should call replacePrice on the db service and return the updated price", async () => {
      const updateDto: ReplacePriceDto = {
        price: 25.0,
        name: {
          en: "test",
          nl: "test",
        },
      };
      const updatedPrice = {
        ...mockPrice,
        price: 25.0,
        name: {
          en: "test",
          nl: "test",
        },
      };
      mockPriceDatabaseService.updatePrice.mockResolvedValue(updatedPrice);

      const result = await service.modifyPrice(1, updateDto);

      expect(dbService.updatePrice).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedPrice);
    });
  });

  describe("modifyPrice", () => {
    it("should call modifyPrice on the db service and return the updated price", async () => {
      const updateDto: ModifyPriceDto = {
        price: 25.0,
      };
      const updatedPrice = { ...mockPrice, price: 25.0 };
      mockPriceDatabaseService.updatePrice.mockResolvedValue(updatedPrice);

      const result = await service.modifyPrice(1, updateDto);

      expect(dbService.updatePrice).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedPrice);
    });
  });

  describe("deletePrice", () => {
    it("should call deletePrice on the db service", async () => {
      mockPriceDatabaseService.deletePrice.mockResolvedValue(undefined);

      await service.deletePrice(1);

      expect(dbService.deletePrice).toHaveBeenCalledWith(1);
    });
  });
});
