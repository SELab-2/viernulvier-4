import { Test, TestingModule } from "@nestjs/testing";
import { EventPriceController } from "./event-price.controller";
import EventService from "../event.service";
import { LanguageService } from "../../util/language/language.service";
import { PriceDto, PriceViewDto, LanguageQueryDto } from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";

describe("EventPriceController", () => {
  let controller: EventPriceController;
  let eventService: EventService;
  let languageService: LanguageService;

  const mockEventService = {
    getPricesForEvent: jest.fn(),
    addPriceToEvent: jest.fn(),
    removePriceFromEvent: jest.fn(),
  };

  const mockLanguageService = {
    flattenByLanguage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventPriceController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
        {
          provide: LanguageService,
          useValue: mockLanguageService,
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
    languageService = module.get<LanguageService>(LanguageService);
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
    it("should call getPricesForEvent and return an array of flattened prices", async () => {
      // Arrange
      const eventId = 1;
      const langQuery: LanguageQueryDto = { lang: "en" };

      // Updated to match the strict LocalizedStringSchema
      const rawPrices: PriceDto[] = [
        {
          id: 1,
          price: 15.5,
          name: { en: "Early Bird", nl: "Vroege vogel" },
          created_at: "2024-01-15T19:00:00Z",
          updated_at: "2024-01-15T19:00:00Z",
          legacy_id: null,
        },
      ];

      // What the LanguageService should spit out when flattened
      const flattenedPrices: PriceViewDto[] = [
        {
          id: 1,
          price: 15.5,
          name: "Early Bird",
          created_at: "2024-01-15T19:00:00Z",
          updated_at: "2024-01-15T19:00:00Z",
          legacy_id: null,
        },
      ];

      mockEventService.getPricesForEvent.mockResolvedValue(rawPrices);
      mockLanguageService.flattenByLanguage.mockReturnValue(flattenedPrices);

      // Act
      const result = await controller.getPricesOfEvent(eventId, langQuery);

      // Assert
      expect(eventService.getPricesForEvent).toHaveBeenCalledWith(eventId);
      expect(eventService.getPricesForEvent).toHaveBeenCalledTimes(1);

      // Ensure the flattening service was invoked correctly
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        rawPrices,
        langQuery.lang,
      );

      expect(result).toEqual(flattenedPrices);
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
