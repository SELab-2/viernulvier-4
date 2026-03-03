import { Test, TestingModule } from "@nestjs/testing";
import EventService from "./event.service";
import { EventDatabaseService } from "../database/db.event.service";
import type {
  CreateEventDto,
  EventDto,
  UpdateEventDto,
  LocationDto,
} from "../dto/dto";
import { BadRequestException } from "@nestjs/common";
import { BlogDatabaseService } from "../database/db.blog.service";
import { FilterEventSchema } from "@repo/common";

describe("EventService", () => {
  let service: EventService;
  let dbService: EventDatabaseService;

  const mockEvent: EventDto = {
    id: 1,
    starttime: "2024-01-15T19:00:00Z",
    endtime: "2024-01-15T21:00:00Z",
    production_id: 1,
    price: 25,
  };

  const mockLocation: LocationDto = {
    id: 1,
    location: "Main Stage",
  };

  const mockBlog = {
    id: 1,
    title: "Event Update",
    content: "This is a blog about the event.",
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
            createEvent: jest.fn(),
            getBlogsOfEvent: jest.fn(),
            linkBlogWithEventID: jest.fn(),
            deleteBlogFromEvent: jest.fn(),
            linkEventToLocation: jest.fn().mockResolvedValue(true),
            deleteLocationFromEvent: jest.fn().mockResolvedValue(undefined),
            getLocationOfEvent: jest.fn().mockResolvedValue(mockLocation),
          },
        },
        {
          provide: BlogDatabaseService,
          useValue: {
            getBlogById: jest.fn().mockResolvedValue(mockBlog),
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
      const result = await service.getAllEvents(FilterEventSchema.parse({}));
      expect(result).toEqual(mockEvents);
      expect(dbService.getEvents).toHaveBeenCalledWith(
        FilterEventSchema.parse({}),
      );
    });

    it("should call dbService.getEvents with empty filter", async () => {
      await service.getAllEvents(FilterEventSchema.parse({}));
      expect(dbService.getEvents).toHaveBeenCalledWith(
        FilterEventSchema.parse({}),
      );
      expect(dbService.getEvents).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no events exist", async () => {
      jest.spyOn(dbService, "getEvents").mockResolvedValueOnce([]);
      const result = await service.getAllEvents(FilterEventSchema.parse({}));
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      jest
        .spyOn(dbService, "getEvents")
        .mockRejectedValueOnce(new Error("Database error"));
      await expect(
        service.getAllEvents(FilterEventSchema.parse({})),
      ).rejects.toThrow("Database error");
    });
  });

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
        "No EventDto exists for provided ID",
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
        BadRequestException,
      );
      await expect(service.replaceEvent(2, mockEvent)).rejects.toThrow(
        "ID in the URL must match ID in the body.",
      );
    });
  });

  describe("modifyEvent", () => {
    it("should fetch, merge, and update the event correctly", async () => {
      const patchData: UpdateEventDto = { price: 50 };
      const expectedMergedEvent: EventDto = { ...mockEvent, price: 50, id: 1 };

      jest
        .spyOn(dbService, "updateEvent")
        .mockResolvedValueOnce(expectedMergedEvent);

      const result = await service.modifyEvent(1, patchData);

      expect(dbService.getEventById).toHaveBeenCalledWith(1);
      expect(dbService.updateEvent).toHaveBeenCalledWith(expectedMergedEvent);
      expect(result).toEqual(expectedMergedEvent);
    });
  });

  describe("deleteEvent", () => {
    it("should delete the event by id", async () => {
      const result = await service.deleteEvent(1);
      expect(dbService.deleteEvent).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it("should handle database errors when deletion fails", async () => {
      jest
        .spyOn(dbService, "deleteEvent")
        .mockRejectedValueOnce(new Error("Failed to delete record"));

      await expect(service.deleteEvent(999)).rejects.toThrow(
        "Failed to delete record",
      );
    });
  });

  describe("createEvent", () => {
    it("should create an event successfully", async () => {
      const newEvent: CreateEventDto = {
        starttime: "2024-02-10T18:00:00Z",
        endtime: "2024-02-10T20:00:00Z",
        production_id: 2,
        price: 30,
      };

      const createdEvent: EventDto = { id: 2, ...newEvent };

      jest.spyOn(dbService, "createEvent").mockResolvedValueOnce(createdEvent);

      const result = await service.createEvent(newEvent);

      expect(dbService.createEvent).toHaveBeenCalledWith(newEvent);
      expect(result).toEqual(createdEvent);
    });

    it("should handle database errors when creation fails", async () => {
      const newEvent: CreateEventDto = {
        starttime: "2024-02-10T18:00:00Z",
        endtime: "2024-02-10T20:00:00Z",
        production_id: 2,
        price: 30,
      };

      jest
        .spyOn(dbService, "createEvent")
        .mockRejectedValueOnce(new Error("Failed to create event"));

      await expect(service.createEvent(newEvent)).rejects.toThrow(
        "Failed to create event",
      );
    });
  });

  describe("linkEventToLocation", () => {
    it("should link an event to a location via DB service", async () => {
      const result = await service.linkEventToLocation(1, 2);
      expect(dbService.linkEventToLocation).toHaveBeenCalledWith(1, 2);
      expect(result).toBe(true);
    });
  });

  describe("unlinkEventFromLocation", () => {
    it("should remove a location from an event via DB service", async () => {
      const result = await service.unlinkEventFromLocation(1);
      expect(dbService.deleteLocationFromEvent).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  describe("getLocationForEvent", () => {
    it("should fetch the location for a given event ID", async () => {
      const result = await service.getLocationForEvent(1);
      expect(dbService.getLocationOfEvent).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLocation);
    });
  });
});
