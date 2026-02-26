import { Test, TestingModule } from "@nestjs/testing";
import { EventController } from "./event.controller";
import EventService from "./event.service";
import type { EventDto, UpdateEventDto, CreateEventDto } from "../dto/dto";
import { NotFoundException } from "@nestjs/common";

describe("EventController", () => {
  let controller: EventController;
  let service: EventService;

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
            getEventBlogs: jest.fn(),
            linkBlogToEvent: jest.fn(),
            unlinkBlogFromEvent: jest.fn(),
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
    it("should modify and return the event", async () => {
      const patchData: UpdateEventDto = { hall: "Secondary Hall" };
      const patchedEvent = { ...mockEvent, hall: "Secondary Hall" };

      jest.spyOn(service, "modifyEvent").mockResolvedValueOnce(patchedEvent);

      const result = await controller.modifyEvent(1, patchData);
      expect(service.modifyEvent).toHaveBeenCalledWith(1, patchData);
      expect(result).toEqual(patchedEvent);
    });

    it("should throw a NotFoundException if event to modify does not exist", async () => {
      const patchData: UpdateEventDto = { hall: "Secondary Hall" };
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

  // ... existing tests ...

  describe("-- Blogs --", () => {
    const mockBlog = {
      id: 1,
      title: "Event Update",
      content: "This is a blog about the event.",
    };

    describe("getEventBlogs", () => {
      it("should return an array of blogs linked to the event", async () => {
        const expectedBlogs = [mockBlog];
        service.getEventBlogs = jest.fn().mockResolvedValue(expectedBlogs);

        const result = await controller.getEventBlogs(1);

        expect(result).toEqual(expectedBlogs);
        expect(service.getEventBlogs).toHaveBeenCalledWith(1);
        expect(service.getEventBlogs).toHaveBeenCalledTimes(1);
      });
    });

    describe("linkBlogToEvent", () => {
      it("should link a blog to an event and return the blog", async () => {
        service.linkBlogToEvent = jest.fn().mockResolvedValue(mockBlog);

        const result = await controller.linkBlogToEvent(1, 2);

        expect(result).toEqual(mockBlog);
        expect(service.linkBlogToEvent).toHaveBeenCalledWith(1, 2);
        expect(service.linkBlogToEvent).toHaveBeenCalledTimes(1);
      });
    });

    describe("unlinkBlogFromEvent", () => {
      it("should unlink a blog from an event and return the unlinked event", async () => {
        service.unlinkBlogFromEvent = jest.fn().mockResolvedValue(mockEvent);

        const result = await controller.unlinkBlogFromEvent(1, 2);

        expect(result).toEqual(mockEvent);
        expect(service.unlinkBlogFromEvent).toHaveBeenCalledWith(1, 2);
        expect(service.unlinkBlogFromEvent).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("createEvent", () => {
    it("should create an event successfully", async () => {
      const newEvent: CreateEventDto = {
        starttime: "2024-02-10T18:00:00Z",
        endtime: "2024-02-10T20:00:00Z",
        hall: "Grand Hall",
        production_id: 2,
        price: 30,
      };

      const createdEvent: EventDto = { id: 2, ...newEvent };

      jest.spyOn(service, "createEvent").mockResolvedValueOnce(createdEvent);

      const result = await controller.createEvent(newEvent);

      expect(service.createEvent).toHaveBeenCalledWith(newEvent);
      expect(result).toEqual(createdEvent);
    });

    it("should handle database errors when creation fails", async () => {
      const newEvent: CreateEventDto = {
        starttime: "2024-02-10T18:00:00Z",
        endtime: "2024-02-10T20:00:00Z",
        hall: "Grand Hall",
        production_id: 2,
        price: 30,
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
