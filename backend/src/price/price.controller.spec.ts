import { Test, TestingModule } from "@nestjs/testing";
import { PriceController } from "./price.controller";
import { PriceService } from "./price.service";
import { LanguageService } from "../util/language/language.service";
import {
  CreatePriceDto,
  LanguageQueryDto,
  PaginationFilterDto,
  PriceDto,
  PriceViewDto,
  ModifyPriceDto,
  ReplacePriceDto,
} from "../dto/dto";
import { ApiKeyGuard } from "../auth/authGuard";

describe("PriceController", () => {
  let controller: PriceController;
  let service: PriceService;
  let languageService: LanguageService;

  // Mock the business logic service
  const mockPriceService = {
    getPrices: jest.fn(),
    getPriceById: jest.fn(),
    createPrice: jest.fn(),
    modifyPrice: jest.fn(),
    replacePrice: jest.fn(),
    deletePrice: jest.fn(),
  };

  const mockLanguageService = {
    flattenByLanguage: jest.fn(),
  };

  // Updated to match localized PriceSchema
  const mockPrice: PriceDto = {
    id: 1,
    price: 20.0,
    name: {
      en: "Standard",
      nl: "Standaard",
    },
    created_at: "2024-01-15T19:00:00Z",
    updated_at: "2024-01-15T19:00:00Z",
  };

  // What the LanguageService will output
  const mockPriceView: PriceViewDto = {
    id: 1,
    price: 20.0,
    name: "Standard",
    created_at: "2024-01-15T19:00:00Z",
    updated_at: "2024-01-15T19:00:00Z",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceController],
      providers: [
        {
          provide: PriceService,
          useValue: mockPriceService,
        },
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<PriceController>(PriceController);
    service = module.get<PriceService>(PriceService);
    languageService = module.get<LanguageService>(LanguageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPrices", () => {
    it("should call getPrices on the service and return an array of flattened prices", async () => {
      const filter: PaginationFilterDto = {
        limit: 10,
        page: 1,
        descending: false,
      };
      const langQuery: LanguageQueryDto = { lang: "en" };

      const rawPrices = [mockPrice];
      const flattenedPrices = [mockPriceView];

      mockPriceService.getPrices.mockResolvedValue(rawPrices);
      mockLanguageService.flattenByLanguage.mockReturnValue(flattenedPrices);

      const result = await controller.getPrices(filter, langQuery);

      expect(service.getPrices).toHaveBeenCalledWith(filter);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        rawPrices,
        langQuery.lang,
      );
      expect(result).toEqual(flattenedPrices);
    });
  });

  describe("getPriceById", () => {
    it("should call getPriceById on the service and return a flattened price", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      mockPriceService.getPriceById.mockResolvedValue(mockPrice);
      mockLanguageService.flattenByLanguage.mockReturnValue(mockPriceView);

      const result = await controller.getPriceById(1, langQuery);

      expect(service.getPriceById).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockPrice,
        langQuery.lang,
      );
      expect(result).toEqual(mockPriceView);
    });
  });

  describe("createPrice", () => {
    it("should call createPrice on the service and return the created price", async () => {
      const createDto: CreatePriceDto = {
        price: 20.0,
        name: { en: "Standard", nl: "Standaard" },
      };
      mockPriceService.createPrice.mockResolvedValue(mockPrice);

      const result = await controller.createPrice(createDto);

      expect(service.createPrice).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPrice);
    });
  });

  describe("replacePrice", () => {
    it("should call replacePrice on the service and return the updated price", async () => {
      const updateDto: ReplacePriceDto = {
        price: 25.0,
        name: {
          en: "test",
          nl: "test",
        },
      };
      const updatedPrice = {
        ...mockPrice,
        price: 25.0,
        name: {
          en: "test",
          nl: "test",
        },
      };
      mockPriceService.replacePrice.mockResolvedValue(updatedPrice);

      const result = await controller.replacePrice(1, updateDto);

      expect(service.replacePrice).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedPrice);
    });
  });

  describe("modifyPrice", () => {
    it("should call modifyPrice on the service and return the updated price", async () => {
      const updateDto: ModifyPriceDto = {
        price: 25.0,
      };
      const updatedPrice = { ...mockPrice, price: 25.0 };
      mockPriceService.modifyPrice.mockResolvedValue(updatedPrice);

      const result = await controller.modifyPrice(1, updateDto);

      expect(service.modifyPrice).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedPrice);
    });
  });

  describe("deletePrice", () => {
    it("should call deletePrice on the service", async () => {
      mockPriceService.deletePrice.mockResolvedValue(undefined);

      await controller.deletePrice(1);

      expect(service.deletePrice).toHaveBeenCalledWith(1);
    });
  });
});
