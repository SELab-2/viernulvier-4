import { Test, TestingModule } from "@nestjs/testing";
import { EventPriceController } from "./event-price.controller";
import EventService from "../event.service";
import { PriceDto } from "../../dto/dto"; // Assuming this is z.infer<typeof PriceSchema>
import { ApiKeyGuard } from "../../auth/authGuard";

describe("EventPriceController", () => {
  let controller: EventPriceController;
  let eventService: EventService;

  const mockEventService = {
    getPricesForEvent: jest.fn(),
    addPriceToEvent: jest.fn(),
    removePriceFromEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventPriceController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<EventPriceController>(EventPriceController);
    eventService = module.get<EventService>(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should be defined", () => {
      expect(controller).toBeDefined();
    });
  });

  describe("getPricesOfEvent", () => {
    it("should call getPricesForEvent and return an array of prices", async () => {
      // Arrange
      const eventId = 1;

      // Updated to match the new PriceSchema (id, price, name)
      const expectedPrices: PriceDto[] = [
        { id: 1, price: 15.5, name: "Early Bird" } as PriceDto,
        { id: 2, price: 25.0, name: "Standard Admission" } as PriceDto,
      ];
      mockEventService.getPricesForEvent.mockResolvedValue(expectedPrices);

      // Act
      const result = await controller.getPricesOfEvent(eventId);

      // Assert
      expect(eventService.getPricesForEvent).toHaveBeenCalledWith(eventId);
      expect(eventService.getPricesForEvent).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedPrices);
    });
  });

  describe("addPriceToEvent", () => {
    it("should call addPriceToEvent and return true on success", async () => {
      // Arrange
      const eventId = 1;
      const priceId = 100;
      mockEventService.addPriceToEvent.mockResolvedValue(true);

      // Act
      const result = await controller.addPriceToEvent(eventId, priceId);

      // Assert
      expect(eventService.addPriceToEvent).toHaveBeenCalledWith(
        eventId,
        priceId,
      );
      expect(eventService.addPriceToEvent).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it("should return false if adding the price fails", async () => {
      // Arrange
      const eventId = 1;
      const priceId = 999;
      mockEventService.addPriceToEvent.mockResolvedValue(false);

      // Act
      const result = await controller.addPriceToEvent(eventId, priceId);

      // Assert
      expect(eventService.addPriceToEvent).toHaveBeenCalledWith(
        eventId,
        priceId,
      );
      expect(result).toBe(false);
    });
  });

  describe("removePriceFromEvent", () => {
    it("should call removePriceFromEvent successfully", async () => {
      // Arrange
      const eventId = 1;
      const priceId = 100;
      mockEventService.removePriceFromEvent.mockResolvedValue(undefined);

      // Act
      await controller.removePriceFromEvent(eventId, priceId);

      // Assert
      expect(eventService.removePriceFromEvent).toHaveBeenCalledWith(
        eventId,
        priceId,
      );
      expect(eventService.removePriceFromEvent).toHaveBeenCalledTimes(1);
    });
  });
});
