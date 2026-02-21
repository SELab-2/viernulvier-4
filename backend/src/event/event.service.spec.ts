import { Test, TestingModule } from "@nestjs/testing";
import { EventService } from "./event.service";
import { EventDatabaseService } from "../database/db.event.service";

describe("EventsService", () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventService,
        {
          provide: EventDatabaseService,
          useValue: {
            getEvents: jest.fn().mockResolvedValue([]),
            updateEvent: jest.fn().mockResolvedValue({}),
          },
        }
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
