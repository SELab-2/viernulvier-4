import { Test, TestingModule } from "@nestjs/testing";
import { PrintItemController } from "./print_item.controller";
import { PrintItemService } from "./print_item.service";
import { LanguageService } from "../util/language/language.service";
import { ApiKeyGuard } from "../auth/authGuard";
import { PaginatedResponse } from "@repo/common";
import {
  CreatePrintItemDto,
  PrintItemDto,
  PrintItemViewDto,
  ModifyPrintItemDto,
  ReplacePrintItemDto,
  PaginationFilterDto,
  LanguageQueryDto,
  FilterPrintItemDto,
} from "../dto/dto";

describe("PrintItemController", () => {
  let controller: PrintItemController;
  let printItemService: jest.Mocked<PrintItemService>;
  let languageService: jest.Mocked<LanguageService>;

  const mockPrintItem: PrintItemDto = {
    id: 1,
    titel: { en: "Print Title", nl: "Print Titel" },
    description: { en: "Print Desc", nl: "Print Beschrijving" },
    url: "https://example.com/print.pdf",
    print_type: "affiche",
    created_at: "2026-03-28T14:00:00.000Z",
    updated_at: "2026-03-28T14:00:00.000Z",
  };

  const mockPrintItemView: PrintItemViewDto = {
    ...mockPrintItem,
    titel: "Print Title",
    description: "Print Desc",
  };

  beforeEach(async () => {
    const mockPrintItemService = {
      getPrintItems: jest.fn(),
      getPrintItemById: jest.fn(),
      createPrintItem: jest.fn(),
      replacePrintItem: jest.fn(),
      modifyPrintItem: jest.fn(),
      deletePrintItem: jest.fn(),
      linkPrintItemToGallery: jest.fn(),
      unlinkPrintItemFromGallery: jest.fn(),
    };

    const mockLanguageService = {
      flattenByLanguage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrintItemController],
      providers: [
        {
          provide: PrintItemService,
          useValue: mockPrintItemService,
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

    controller = module.get<PrintItemController>(PrintItemController);
    printItemService = module.get(PrintItemService);
    languageService = module.get(LanguageService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getPrintItems", () => {
    it("should fetch, flatten, and return a paginated list of print items", async () => {
      const paginationFilter: PaginationFilterDto = {
        page: 1,
        limit: 10,
        descending: true,
      };
      const langQuery: LanguageQueryDto = { lang: "en" };
      const paginatedItems: PaginatedResponse<PrintItemDto> = {
        objects: [mockPrintItem],
        totalItems: 1,
        page: 1,
        limit: 10,
      };

      const expectedFlattened: PaginatedResponse<PrintItemViewDto> = {
        ...paginatedItems,
        objects: [mockPrintItemView],
      };

      printItemService.getPrintItems.mockResolvedValue(paginatedItems);
      languageService.flattenByLanguage.mockReturnValue(expectedFlattened);

      const result = await controller.getPrintItems(
        paginationFilter,
        langQuery,
        { is_suggestion: false },
      );

      expect(printItemService.getPrintItems).toHaveBeenCalledWith(
        paginationFilter,
        { is_suggestion: false },
        langQuery.lang,
      );
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        paginatedItems,
        langQuery.lang,
      );
      expect(result).toEqual(expectedFlattened);
    });

    it("should pass the filters parameter to the service when provided", async () => {
      const paginationFilter: PaginationFilterDto = {
        page: 1,
        limit: 10,
        descending: true,
      };
      const langQuery: LanguageQueryDto = { lang: "en" };
      const filters: FilterPrintItemDto = {
        type: "affiche",
        title: "brugge",
        is_suggestion: false,
      };

      const paginatedItems: PaginatedResponse<PrintItemDto> = {
        objects: [],
        totalItems: 0,
        page: 1,
        limit: 10,
      };

      printItemService.getPrintItems.mockResolvedValue(paginatedItems);
      languageService.flattenByLanguage.mockReturnValue(paginatedItems);

      await controller.getPrintItems(paginationFilter, langQuery, filters);

      expect(printItemService.getPrintItems).toHaveBeenCalledWith(
        paginationFilter,
        filters,
        langQuery.lang,
      );
    });
  });

  describe("getPrintItemById", () => {
    it("should fetch, flatten, and return a single print item", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      printItemService.getPrintItemById.mockResolvedValue(mockPrintItem);
      languageService.flattenByLanguage.mockReturnValue(mockPrintItemView);

      const result = await controller.getPrintItemById(1, langQuery);

      expect(printItemService.getPrintItemById).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockPrintItem,
        "en",
      );
      expect(result).toEqual(mockPrintItemView);
    });
  });

  describe("createPrintItem", () => {
    it("should create and return a new print item", async () => {
      const createItemDto: CreatePrintItemDto = {
        titel: { en: "Print Title", nl: "Print Titel" },
        description: { en: "Print Desc", nl: "Print Beschrijving" },
        url: "https://example.com/print.pdf",
        print_type: "affiche",
      };
      printItemService.createPrintItem.mockResolvedValue(mockPrintItem);

      const result = await controller.createPrintItem(createItemDto);

      expect(printItemService.createPrintItem).toHaveBeenCalledWith(
        createItemDto,
      );
      expect(result).toEqual(mockPrintItem);
    });
  });

  describe("replacePrintItem", () => {
    it("should replace and return the print item", async () => {
      const replaceItemDto: ReplacePrintItemDto = {
        titel: { en: "Print Title", nl: "Print Titel" },
        description: { en: "Print Desc", nl: "Print Beschrijving" },
        url: "https://example.com/print.pdf",
        print_type: "affiche",
      };
      printItemService.replacePrintItem.mockResolvedValue(mockPrintItem);

      const result = await controller.replacePrintItem(1, replaceItemDto);

      expect(printItemService.replacePrintItem).toHaveBeenCalledWith(
        1,
        replaceItemDto,
      );
      expect(result).toEqual(mockPrintItem);
    });
  });

  describe("modifyPrintItem", () => {
    it("should modify and return the print item", async () => {
      const modifyItemDto: ModifyPrintItemDto = {
        url: "https://example.com/new.pdf",
      };
      printItemService.modifyPrintItem.mockResolvedValue(mockPrintItem);

      const result = await controller.modifyPrintItem(1, modifyItemDto);

      expect(printItemService.modifyPrintItem).toHaveBeenCalledWith(
        1,
        modifyItemDto,
      );
      expect(result).toEqual(mockPrintItem);
    });
  });

  describe("deletePrintItem", () => {
    it("should delete the print item", async () => {
      printItemService.deletePrintItem.mockResolvedValue(undefined);

      await controller.deletePrintItem(1);

      expect(printItemService.deletePrintItem).toHaveBeenCalledWith(1);
    });
  });
});
