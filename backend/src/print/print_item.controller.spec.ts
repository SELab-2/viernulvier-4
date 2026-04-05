import { Test, TestingModule } from "@nestjs/testing";
import { PrintItemController } from "./print_item.controller"; // Zorg dat deze import klopt met je bestandsnaam
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
      languageService.flattenByLanguage.mockReturnValue(
        expectedFlattened as any,
      );

      const result = await controller.getPrintItems(paginationFilter, langQuery);

      expect(printItemService.getPrintItems).toHaveBeenCalledWith(paginationFilter);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        paginatedItems,
        "en",
      );
      expect(result).toEqual(expectedFlattened);
    });
  });

  describe("getPrintItemById", () => {
    it("should fetch, flatten, and return a single print item", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      printItemService.getPrintItemById.mockResolvedValue(mockPrintItem);
      languageService.flattenByLanguage.mockReturnValue(mockPrintItemView as any);

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
      };
      printItemService.createPrintItem.mockResolvedValue(mockPrintItem);

      const result = await controller.createPrintItem(createItemDto);

      expect(printItemService.createPrintItem).toHaveBeenCalledWith(createItemDto);
      expect(result).toEqual(mockPrintItem);
    });
  });

  describe("replacePrintItem", () => {
    it("should replace and return the print item", async () => {
      const replaceItemDto: ReplacePrintItemDto = {
        titel: { en: "Print Title", nl: "Print Titel" },
        description: { en: "Print Desc", nl: "Print Beschrijving" },
        url: "https://example.com/print.pdf",
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
      const modifyItemDto: ModifyPrintItemDto = { url: "https://example.com/new.pdf" };
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

  describe("linkToGallery", () => {
    it("should link a print item to a gallery", async () => {
      printItemService.linkPrintItemToGallery.mockResolvedValue(undefined);

      await controller.linkToGallery(1, 2);

      expect(printItemService.linkPrintItemToGallery).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("unlinkFromGallery", () => {
    it("should unlink a print item from a gallery", async () => {
      printItemService.unlinkPrintItemFromGallery.mockResolvedValue(undefined);

      await controller.unlinkFromGallery(1, 2);

      expect(printItemService.unlinkPrintItemFromGallery).toHaveBeenCalledWith(1, 2);
    });
  });
});