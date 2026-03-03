import { Test, TestingModule } from "@nestjs/testing";
import { EventLocationController } from "./event-location.controller";
import EventService from "../event.service";
import { LocationDto } from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";

describe("EventLocationController", () => {
  let controller: EventLocationController;
  let eventService: EventService;

  // Mock data based on your LocationSchema (id, location)
  const mockLocation: LocationDto = {
    id: 1,
    location: "Main Stage",
  };

  const mockEventId = 42;
  const mockLocationId = 1;

  // Mocking the EventService
  const mockEventService = {
    getLocationForEvent: jest.fn().mockResolvedValue(mockLocation),
    linkEventToLocation: jest.fn().mockResolvedValue(true),
    unlinkEventFromLocation: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventLocationController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    })
      // Bypassing the guard just like we did in the LocationController
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventLocationController>(EventLocationController);
    eventService = module.get<EventService>(EventService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getLocationOfEvent", () => {
    it("should return the location of a specific event", async () => {
      const result = await controller.getLocationOfEvent(mockEventId);
      expect(result).toEqual(mockLocation);
      expect(eventService.getLocationForEvent).toHaveBeenCalledWith(
        mockEventId,
      );
    });
  });

  describe("linkEventToLocation", () => {
    it("should link an event to a location and return true", async () => {
      const result = await controller.linkEventToLocation(
        mockEventId,
        mockLocationId,
      );
      expect(result).toBe(true);
      expect(eventService.linkEventToLocation).toHaveBeenCalledWith(
        mockEventId,
        mockLocationId,
      );
    });
  });

  describe("unlinkEventFromLocation", () => {
    it("should unlink a location from an event", async () => {
      const result = await controller.unlinkEventFromLocation(mockEventId);
      expect(result).toBeUndefined();
      expect(eventService.unlinkEventFromLocation).toHaveBeenCalledWith(
        mockEventId,
      );
    });
  });
});
