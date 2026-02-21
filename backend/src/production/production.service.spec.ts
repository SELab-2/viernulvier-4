import { Test, TestingModule } from "@nestjs/testing";
import { ProductionService } from "./production.service";
import { ProductionDatabaseService } from "../database/db.production.service";

describe("ProductionService", () => {
  let service: ProductionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionService,
        {
          provide: ProductionDatabaseService,
          useValue: {
            getProductions: jest.fn().mockResolvedValue([]),
            updateProduction: jest.fn().mockResolvedValue({}),
          },
        }
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
