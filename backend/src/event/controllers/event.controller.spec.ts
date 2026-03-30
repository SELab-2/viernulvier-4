import { Test, TestingModule } from "@nestjs/testing";
import { EventController } from "./event.controller";
import EventService from "../event.service";
import type { CreateEventDto, EventDto, ModifyEventDto } from "../../dto/dto";
import { NotFoundException } from "@nestjs/common";
import { ApiKeyGuard, SuperApiKeyGuard } from "../../auth/authGuard";
import { FilterEventSchema } from "@repo/common";

describe("EventController", () => {
  let controller: EventController;
  let service: EventService;

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

  const mockEvents: EventDto[] = [mockEvent];

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
            createEvent: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(SuperApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllEvents", () => {
    it("should return an array of events", async () => {
      const result = await controller.getAllEvents(FilterEventSchema.parse({}));
      expect(result).toEqual(mockEvents);
      expect(service.getAllEvents).toHaveBeenCalled();
    });

    it("should call service.getAllEvents", async () => {
      await controller.getAllEvents(FilterEventSchema.parse({}));
      expect(service.getAllEvents).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no events exist", async () => {
      jest.spyOn(service, "getAllEvents").mockResolvedValueOnce({
        page: 0,
        limit: 20,
        totalItems: 0,
        objects: [],
      });
      const result = await controller.getAllEvents(FilterEventSchema.parse({}));
      expect(result).toEqual({
        page: 0,
        limit: 20,
        totalItems: 0,
        objects: [],
      });
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
      jest
        .spyOn(service, "getEventById")
        .mockResolvedValueOnce({ ...mockEvent, id: 5 });
      const result = await controller.getEventById(5);
      expect(result.id).toBe(5);
      expect(service.getEventById).toHaveBeenCalledWith(5);
    });

    it("should throw a NotFoundException if event does not exist", async () => {
      jest
        .spyOn(service, "getEventById")
        .mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getEventById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("replaceEvent", () => {
    it("should replace and return the event", async () => {
      const result = await controller.replaceEvent(1, mockEvent);
      expect(service.replaceEvent).toHaveBeenCalledWith(1, mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it("should throw a NotFoundException if event to replace does not exist", async () => {
      jest
        .spyOn(service, "replaceEvent")
        .mockRejectedValueOnce(new NotFoundException());
      await expect(controller.replaceEvent(999, mockEvent)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("modifyEvent", () => {
    it("should partially update and return the event", async () => {
      const patchData: ModifyEventDto = {
        starttime: "2026-03-06T23:08:45.328Z",
      };
      const expectedEvent: EventDto = {
        ...mockEvent,
        starttime: "2026-03-06T23:08:45.328Z",
      };

      jest.spyOn(service, "modifyEvent").mockResolvedValueOnce(expectedEvent);

      const result = await controller.modifyEvent(1, patchData);

      expect(service.modifyEvent).toHaveBeenCalledWith(1, patchData);
      expect(result).toEqual(expectedEvent);
    });

    it("should throw a NotFoundException if event to modify does not exist", async () => {
      const patchData: ModifyEventDto = {
        starttime: "2026-03-06T23:08:45.328Z",
      };

      jest
        .spyOn(service, "modifyEvent")
        .mockRejectedValueOnce(new NotFoundException());

      await expect(controller.modifyEvent(999, patchData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("deleteEvent", () => {
    it("should delete the event by id", async () => {
      const result = await controller.deleteEvent(1);
      expect(service.deleteEvent).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it("should throw a NotFoundException if event to delete does not exist", async () => {
      jest
        .spyOn(service, "deleteEvent")
        .mockRejectedValueOnce(new NotFoundException());
      await expect(controller.deleteEvent(999)).rejects.toThrow(
        NotFoundException,
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

      jest.spyOn(service, "createEvent").mockResolvedValueOnce(createdEvent);

      const result = await controller.createEvent(newEvent);

      expect(service.createEvent).toHaveBeenCalledWith(newEvent);
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
        .spyOn(service, "createEvent")
        .mockRejectedValueOnce(new Error("Failed to create event"));

      await expect(controller.createEvent(newEvent)).rejects.toThrow(
        "Failed to create event",
      );
    });
  });
});
