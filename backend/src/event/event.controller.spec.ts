import { Test, TestingModule } from "@nestjs/testing";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import type { Event } from "@repo/common";

describe("EventController", () => {
  let controller: EventController;
  let service: EventService;

  const mockEvent: Event = {
    id: 1,
    starttime: "2024-01-15T19:00:00Z",
    endtime: "2024-01-15T21:00:00Z",
    hall: "Main Hall",
    production_id: 1,
    price: 25,
  };

  const mockEvents: Event[] = [mockEvent];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: {
            getAllEvents: jest.fn().mockResolvedValue(mockEvents),
            getEventById: jest.fn().mockResolvedValue(mockEvent),
            updateEvent: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllEvents", () => {
    it("should return an array of events", async () => {
      const result = await controller.getAllEvents();
      expect(result).toEqual(mockEvents);
      expect(service.getAllEvents).toHaveBeenCalled();
    });

    it("should call service.getAllEvents", async () => {
      await controller.getAllEvents();
      expect(service.getAllEvents).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no events exist", async () => {
      jest.spyOn(service, "getAllEvents").mockResolvedValueOnce([]);
      const result = await controller.getAllEvents();
      expect(result).toEqual([]);
    });
  });

  describe("getEventById", () => {
    it("should return a single event by id", async () => {
      const result = await controller.getEventById(1);
      expect(result).toEqual(mockEvent);
      expect(service.getEventById).toHaveBeenCalledWith(1);
    });

    it("should call service.getEventById with correct id", async () => {
      await controller.getEventById(1);
      expect(service.getEventById).toHaveBeenCalledWith(1);
    });

    it("should handle different event ids", async () => {
      jest.spyOn(service, "getEventById").mockResolvedValueOnce({ ...mockEvent, id: 5 });
      const result = await controller.getEventById(5);
      expect(result.id).toBe(5);
      expect(service.getEventById).toHaveBeenCalledWith(5);
    });
  });
});
