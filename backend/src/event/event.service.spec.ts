import { Test, TestingModule } from "@nestjs/testing";
import { EventService } from "./event.service";
import { EventDatabaseService } from "../database/db.event.service";
import type { Event } from "@repo/common";

describe("EventService", () => {
  let service: EventService;
  let dbService: EventDatabaseService;

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
      providers: [
        EventService,
        {
          provide: EventDatabaseService,
          useValue: {
            getEvents: jest.fn().mockResolvedValue(mockEvents),
            getEventById: jest.fn().mockResolvedValue(mockEvent),
            updateEvent: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    dbService = module.get<EventDatabaseService>(EventDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAllEvents", () => {
    it("should return all events from database", async () => {
      const result = await service.getAllEvents();
      expect(result).toEqual(mockEvents);
      expect(dbService.getEvents).toHaveBeenCalledWith({});
    });

    it("should call dbService.getEvents with empty filter", async () => {
      await service.getAllEvents();
      expect(dbService.getEvents).toHaveBeenCalledWith({});
      expect(dbService.getEvents).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no events exist", async () => {
      jest.spyOn(dbService, "getEvents").mockResolvedValueOnce([]);
      const result = await service.getAllEvents();
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      jest
        .spyOn(dbService, "getEvents")
        .mockRejectedValueOnce(new Error("Database error"));
      await expect(service.getAllEvents()).rejects.toThrow("Database error");
    });
  });
  // TODO: change when getEventByProdcutionId returns multiple events with same production id
  describe("getEventById", () => {
    it("should return event by id from database", async () => {
      const result = await service.getEventById(1);
      expect(result).toEqual(mockEvent);
      expect(dbService.getEventById).toHaveBeenCalledWith(1);
    });

    it("should call dbService.getEventById with correct id", async () => {
      await service.getEventById(1);
      expect(dbService.getEventById).toHaveBeenCalledWith(1);
      expect(dbService.getEventById).toHaveBeenCalledTimes(1);
    });

    it("should handle different event ids", async () => {
      const event2 = { ...mockEvent, id: 2 };
      jest.spyOn(dbService, "getEventById").mockResolvedValueOnce(event2);
      const result = await service.getEventById(2);
      expect(result.id).toBe(2);
      expect(dbService.getEventById).toHaveBeenCalledWith(2);
    });

    it("should handle database error when event not found", async () => {
      jest
        .spyOn(dbService, "getEventById")
        .mockRejectedValueOnce(new Error("No Event exists for provided ID"));
      await expect(service.getEventById(999)).rejects.toThrow(
        "No Event exists for provided ID"
      );
    });
  });
});
