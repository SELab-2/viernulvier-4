import { Test, TestingModule } from "@nestjs/testing";
import { EventLocationController } from "./event-location.controller";
import EventService from "../event.service";
import { LanguageService } from "../../util/language/language.service";
import { LocationDto, LocationViewDto, LanguageQueryDto } from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";

describe("EventLocationController", () => {
  let controller: EventLocationController;
  let eventService: EventService;
  let languageService: LanguageService;

  // Mock data based on your strictly localized LocationSchema
  const mockLocation: LocationDto = {
    id: 1,
    location: {
      en: "Citadel Park",
      nl: "Citadelpark",
    },
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  // What we expect the LanguageService to return after flattening
  const mockLocationView: LocationViewDto = {
    id: 1,
    location: "Citadel Park",
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  const mockEventId = 42;
  const mockLocationId = 1;

  // Mocking the EventService
  const mockEventService = {
    getLocationForEvent: jest.fn(),
    linkEventToLocation: jest.fn(),
    unlinkEventFromLocation: jest.fn(),
  };

  // Mocking the LanguageService
  const mockLanguageService = {
    flattenByLanguage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventLocationController],
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
      // Bypassing the guard
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventLocationController>(EventLocationController);
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

  describe("getLocationOfEvent", () => {
    it("should return the location of a specific event flattened by language", async () => {
      // Arrange
      const langQuery: LanguageQueryDto = { lang: "en" };
      mockEventService.getLocationForEvent.mockResolvedValue(mockLocation);
      mockLanguageService.flattenByLanguage.mockReturnValue(mockLocationView);

      // Act
      const result = await controller.getLocationOfEvent(
        mockEventId,
        langQuery,
      );

      // Assert
      expect(eventService.getLocationForEvent).toHaveBeenCalledWith(
        mockEventId,
      );
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockLocation,
        langQuery.lang,
      );
      expect(result).toEqual(mockLocationView);
    });
  });

  describe("linkEventToLocation", () => {
    it("should link an event to a location and return true", async () => {
      // Arrange
      mockEventService.linkEventToLocation.mockResolvedValue(true);

      // Act
      const result = await controller.linkEventToLocation(
        mockEventId,
        mockLocationId,
      );

      // Assert
      expect(result).toBe(true);
      expect(eventService.linkEventToLocation).toHaveBeenCalledWith(
        mockEventId,
        mockLocationId,
      );
    });
  });

  describe("unlinkEventFromLocation", () => {
    it("should unlink a location from an event", async () => {
      // Arrange
      mockEventService.unlinkEventFromLocation.mockResolvedValue(undefined);

      // Act
      const result = await controller.unlinkEventFromLocation(mockEventId);

      // Assert
      expect(result).toBeUndefined();
      expect(eventService.unlinkEventFromLocation).toHaveBeenCalledWith(
        mockEventId,
      );
    });
  });
});
