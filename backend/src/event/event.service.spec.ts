import { Test, TestingModule } from "@nestjs/testing";
import { EventService } from "./event.service";
import { EventDatabaseService } from "../database/db.event.service";
import type { EventDto, UpdateEventDto } from "../dto/dto";
import { BadRequestException } from "@nestjs/common";

describe("EventService", () => {
  let service: EventService;
  let dbService: EventDatabaseService;

  const mockEvent: EventDto = {
    id: 1,
    starttime: "2024-01-15T19:00:00Z",
    endtime: "2024-01-15T21:00:00Z",
    hall: "Main Hall",
    production_id: 1,
    price: 25,
  };

  const mockEvents: EventDto[] = [mockEvent];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventDatabaseService,
          useValue: {
            getEvents: jest.fn().mockResolvedValue(mockEvents),
            getEventById: jest.fn().mockResolvedValue(mockEvent),
            updateEvent: jest.fn().mockResolvedValue(mockEvent),
            deleteEvent: jest.fn().mockResolvedValue(undefined),
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
        .mockRejectedValueOnce(new Error("No EventDto exists for provided ID"));
      await expect(service.getEventById(999)).rejects.toThrow(
        "No EventDto exists for provided ID"
      );
    });
  });

  describe("replaceEvent", () => {
    it("should successfully replace and return the event", async () => {
      const result = await service.replaceEvent(1, mockEvent);
      expect(dbService.updateEvent).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it("should throw BadRequestException if url id and body id do not match", async () => {
      await expect(service.replaceEvent(2, mockEvent)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.replaceEvent(2, mockEvent)).rejects.toThrow(
        "ID in the URL must match ID in the body."
      );
    });
  });

  describe("modifyEvent", () => {
    it("should fetch, merge, update, and return the modified event", async () => {
      const patchData: UpdateEventDto = { hall: "Secondary Hall" };
      const expectedMergedEvent = { ...mockEvent, ...patchData, id: 1 };
      
      jest.spyOn(dbService, "updateEvent").mockResolvedValueOnce(expectedMergedEvent);

      const result = await service.modifyEvent(1, patchData);

      expect(dbService.getEventById).toHaveBeenCalledWith(1);
      expect(dbService.updateEvent).toHaveBeenCalledWith(expectedMergedEvent);
      expect(result).toEqual(expectedMergedEvent);
    });

    it("should throw an error if the event to modify does not exist", async () => {
      const patchData: UpdateEventDto = { hall: "Secondary Hall" };
      
      // Service fetches by ID first, so mock that fetch to fail
      jest.spyOn(dbService, "getEventById").mockRejectedValueOnce(new Error("No EventDto exists for provided ID"));
    
      await expect(service.modifyEvent(999, patchData)).rejects.toThrow("No EventDto exists for provided ID");
      expect(dbService.updateEvent).not.toHaveBeenCalled();
    });
  });

  describe("deleteEvent", () => {
    it("should delete the event by id and pass an empty string for the date", async () => {
      const result = await service.deleteEvent(1);
      // Validates your existing implementation: `this.eventDBService.deleteEvent(id, "");`
      expect(dbService.deleteEvent).toHaveBeenCalledWith(1, "");
      expect(result).toBeUndefined();
    });

    it("should handle database errors when deletion fails", async () => {
      jest.spyOn(dbService, "deleteEvent").mockRejectedValueOnce(new Error("Failed to delete record"));
    
      await expect(service.deleteEvent(999)).rejects.toThrow("Failed to delete record");
    });
  });

  // TODO: Missing createEvent test
});
