import { Test, TestingModule } from "@nestjs/testing";
import { PriceController } from "./price.controller";
import { PriceService } from "./price.service";
import {
  CreatePriceDto,
  PaginationFilterDto,
  PriceDto,
  UpdatePriceDto,
} from "../dto/dto";
import { ApiKeyGuard } from "../auth/authGuard";

describe("PriceController", () => {
  let controller: PriceController;
  let service: PriceService;

  // Mock the business logic service
  const mockPriceService = {
    getPrices: jest.fn(),
    getPriceById: jest.fn(),
    createPrice: jest.fn(),
    updatePrice: jest.fn(),
    deletePrice: jest.fn(),
  };

  const mockPrice: PriceDto = {
    id: 1,
    price: 20.0,
    name: "Standard",
  } as PriceDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceController],
      providers: [
        {
          provide: PriceService,
          useValue: mockPriceService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<PriceController>(PriceController);
    service = module.get<PriceService>(PriceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPrices", () => {
    it("should call getPrices on the service with the pagination filter", async () => {
      const filter: PaginationFilterDto = {
        limit: 10,
        page: 1,
      } as PaginationFilterDto;
      const expectedPrices = [mockPrice];
      mockPriceService.getPrices.mockResolvedValue(expectedPrices);

      const result = await controller.getPrices(filter);

      expect(service.getPrices).toHaveBeenCalledWith(filter);
      expect(result).toEqual(expectedPrices);
    });
  });

  describe("getPriceById", () => {
    it("should call getPriceById on the service and return a price", async () => {
      mockPriceService.getPriceById.mockResolvedValue(mockPrice);

      const result = await controller.getPriceById(1);

      expect(service.getPriceById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPrice);
    });
  });

  describe("createPrice", () => {
    it("should call createPrice on the service and return the created price", async () => {
      const createDto: CreatePriceDto = {
        price: 20.0,
        name: "Standard",
      } as CreatePriceDto;
      mockPriceService.createPrice.mockResolvedValue(mockPrice);

      const result = await controller.createPrice(createDto);

      expect(service.createPrice).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPrice);
    });
  });

  describe("updatePrice", () => {
    it("should call updatePrice on the service and return the updated price", async () => {
      const updateDto: UpdatePriceDto = {
        id: 1,
        price: 25.0,
      } as UpdatePriceDto;
      const updatedPrice = { ...mockPrice, price: 25.0 };
      mockPriceService.updatePrice.mockResolvedValue(updatedPrice);

      const result = await controller.updatePrice(updateDto);

      expect(service.updatePrice).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(updatedPrice);
    });
  });

  describe("deletePrice", () => {
    it("should call deletePrice on the service", async () => {
      mockPriceService.deletePrice.mockResolvedValue(undefined);

      await controller.deletePrice(1);

      expect(service.deletePrice).toHaveBeenCalledWith(1);
    });
  });
});
