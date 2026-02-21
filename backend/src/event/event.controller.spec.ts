import { Test, TestingModule } from "@nestjs/testing";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import type { Event, UpdateEvent } from "@repo/common";

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
            replaceEvent: jest.fn().mockResolvedValue(mockEvent),
            modifyEvent: jest.fn().mockResolvedValue(mockEvent),
            deleteEvent: jest.fn().mockResolvedValue(undefined),
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

  // TODO: change when getEventByProdcutionId returns multiple events with same production id
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

  describe("replaceEvent", () => {
    it("should replace and return the event", async () => {
      const result = await controller.replaceEvent(1, mockEvent);
      expect(service.replaceEvent).toHaveBeenCalledWith(1, mockEvent);
      expect(result).toEqual(mockEvent);
    });
  });

  describe("modifyEvent", () => {
    it("should modify and return the event", async () => {
      const patchData: UpdateEvent = { hall: "Secondary Hall" };
      const patchedEvent = { ...mockEvent, hall: "Secondary Hall" };
      
      jest.spyOn(service, "modifyEvent").mockResolvedValueOnce(patchedEvent);
      
      const result = await controller.modifyEvent(1, patchData);
      expect(service.modifyEvent).toHaveBeenCalledWith(1, patchData);
      expect(result).toEqual(patchedEvent);
    });
  });

  describe("deleteEvent", () => {
    it("should delete the event by id", async () => {
      const result = await controller.deleteEvent(1);
      expect(service.deleteEvent).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  // TODO: Missing test for createEvent.
});
