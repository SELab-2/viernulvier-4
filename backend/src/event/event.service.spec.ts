import { Test, TestingModule } from "@nestjs/testing";
import EventService from "./event.service";
import { EventDatabaseService } from "../database/db.event.service";
import {
  type CreateEventDto,
  type EventDto,
  type LocationDto,
  type ModifyEventDto,
  type PriceDto,
} from "../dto/dto";
import { BlogDatabaseService } from "../database/db.blog.service";
import { FilterEventSchema, PaginationFilterSchema } from "@repo/common";

describe("EventService", () => {
  let service: EventService;
  let dbService: EventDatabaseService;

  const mockEvent: EventDto = {
    id: 1,
    starttime: "2024-01-15T19:00:00Z",
    endtime: "2024-01-15T21:00:00Z",
    production_id: 1,
    doors_at: "2024-01-15T19:00:00Z",
    intermission_at: "2024-01-15T19:00:00Z",
    created_at: "2024-01-15T19:00:00Z",
    updated_at: "2024-01-15T19:00:00Z",
  };

  // Updated Location to use LocalizedStringSchema
  const mockLocation: LocationDto = {
    id: 1,
    location: {
      en: "Citadel Park",
      nl: "Citadelpark",
    },
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  // Updated Blog to use LocalizedStringSchema (even if it's just mocked for db configuration)
  const mockBlog = {
    id: 1,
    titel: {
      en: "Event Update",
      nl: "Evenement Update",
    },
    description: {
      en: "This is a blog about the event.",
      nl: "Dit is een blog over het evenement.",
    },
    created_at: "2024-01-15T19:00:00Z",
    updated_at: "2024-01-15T19:00:00Z",
  };

  // Updated Prices to use LocalizedStringSchema and full DTO fields
  const mockPrices: PriceDto[] = [
    {
      id: 1,
      price: 15.5,
      name: {
        en: "Early Bird",
        nl: "Vroege vogel",
      },
      created_at: "2024-01-15T19:00:00Z",
      updated_at: "2024-01-15T19:00:00Z",
    },
  ];

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
            linkEventToLocation: jest.fn(),
            deleteLocationFromEvent: jest.fn().mockResolvedValue(undefined),
            getLocationOfEvent: jest.fn().mockResolvedValue(mockLocation),

            // <-- Added Price DB mock methods
            getPricesOfEvent: jest.fn().mockResolvedValue(mockPrices),
            addPriceToEvent: jest.fn().mockResolvedValue(true),
            removePriceFromEvent: jest.fn().mockResolvedValue(undefined),
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
      const result = await service.getAllEvents(
        FilterEventSchema.parse({}),
        PaginationFilterSchema.parse({}),
      );
      expect(result).toEqual(mockEvents);
      expect(dbService.getEvents).toHaveBeenCalledWith(
        FilterEventSchema.parse({}),
        PaginationFilterSchema.parse({}),
      );
    });

    it("should call dbService.getEvents with empty filter", async () => {
      await service.getAllEvents(
        FilterEventSchema.parse({}),
        PaginationFilterSchema.parse({}),
      );
      expect(dbService.getEvents).toHaveBeenCalledWith(
        FilterEventSchema.parse({}),
        PaginationFilterSchema.parse({}),
      );
      expect(dbService.getEvents).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no events exist", async () => {
      jest.spyOn(dbService, "getEvents").mockResolvedValueOnce({
        page: 0,
        limit: 20,
        totalItems: 0,
        objects: [],
      });
      const result = await service.getAllEvents(
        FilterEventSchema.parse({}),
        PaginationFilterSchema.parse({}),
      );
      expect(result).toEqual({
        page: 0,
        limit: 20,
        totalItems: 0,
        objects: [],
      });
    });

    it("should handle database errors", async () => {
      jest
        .spyOn(dbService, "getEvents")
        .mockRejectedValueOnce(new Error("Database error"));
      await expect(
        service.getAllEvents(
          FilterEventSchema.parse({}),
          PaginationFilterSchema.parse({}),
        ),
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
      expect(dbService.updateEvent).toHaveBeenCalledWith(1, mockEvent);
      expect(result).toEqual(mockEvent);
    });
  });

  describe("modifyEvent", () => {
    it("should update the event accordingly", async () => {
      const patchData: ModifyEventDto = {
        starttime: "2026-03-06T23:08:45.328Z",
      };
      const resultData: EventDto = {
        ...mockEvent,
        starttime: "2026-03-06T23:08:45.328Z",
        id: 1,
      };

      jest.spyOn(dbService, "updateEvent").mockResolvedValueOnce(resultData);

      const result = await service.modifyEvent(1, patchData);

      expect(dbService.updateEvent).toHaveBeenCalledWith(1, patchData);
      expect(result).toEqual(resultData);
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
        starttime: "2024-01-15T19:00:00Z",
        endtime: "2024-01-15T21:00:00Z",
        production_id: 1,
        doors_at: "2024-01-15T19:00:00Z",
        intermission_at: "2024-01-15T19:00:00Z",
      };

      const createdEvent: EventDto = {
        id: 2,
        ...newEvent,
        created_at: "2024-01-15T19:00:00Z",
        updated_at: "2024-01-15T19:00:00Z",
      };

      jest.spyOn(dbService, "createEvent").mockResolvedValueOnce(createdEvent);

      const result = await service.createEvent(newEvent);

      expect(dbService.createEvent).toHaveBeenCalledWith(newEvent);
      expect(result).toEqual(createdEvent);
    });

    it("should handle database errors when creation fails", async () => {
      const newEvent: CreateEventDto = {
        starttime: "2024-01-15T19:00:00Z",
        endtime: "2024-01-15T21:00:00Z",
        production_id: 1,
        doors_at: "2024-01-15T19:00:00Z",
        intermission_at: "2024-01-15T19:00:00Z",
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
    it("should link an event to a location via DB service", () => {
      expect(dbService.linkEventToLocation).toHaveBeenCalledWith(1, 2);
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

  describe("getPricesForEvent", () => {
    it("should return all Price objects linked to an event", async () => {
      const eventId = 1;
      const result = await service.getPricesForEvent(eventId);

      expect(dbService.getPricesOfEvent).toHaveBeenCalledWith(eventId);
      expect(dbService.getPricesOfEvent).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPrices);
    });
  });

  describe("addPriceToEvent", () => {
    it("should add an existing Price to an Event and return true", async () => {
      const eventId = 1;
      const priceId = 100;

      const result = await service.addPriceToEvent(eventId, priceId);

      expect(dbService.addPriceToEvent).toHaveBeenCalledWith(eventId, priceId);
      expect(dbService.addPriceToEvent).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it("should return false if DB service fails to add price to event", async () => {
      const eventId = 1;
      const priceId = 999;

      // Override the mock to return false for this specific test
      jest.spyOn(dbService, "addPriceToEvent").mockResolvedValueOnce(false);

      const result = await service.addPriceToEvent(eventId, priceId);

      expect(dbService.addPriceToEvent).toHaveBeenCalledWith(eventId, priceId);
      expect(result).toBe(false);
    });
  });

  describe("removePriceFromEvent", () => {
    it("should remove an existing Price from an Event via DB service", async () => {
      const eventId = 1;
      const priceId = 100;

      const result = await service.removePriceFromEvent(eventId, priceId);

      expect(dbService.removePriceFromEvent).toHaveBeenCalledWith(
        eventId,
        priceId,
      );
      expect(dbService.removePriceFromEvent).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
