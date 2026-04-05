import { Test, TestingModule } from "@nestjs/testing";
import { PrintItemService } from "./print_item.service";
import { PrintItemDatabaseService } from "../database/db.print_item.service";
import { PaginatedResponse } from "@repo/common";
import {
  CreatePrintItemDto,
  PrintItemDto,
  ModifyPrintItemDto,
  PaginationFilterDto,
  ReplacePrintItemDto,
} from "../dto/dto";

describe("PrintItemService", () => {
  let service: PrintItemService;
  let printDbService: jest.Mocked<PrintItemDatabaseService>;

  const mockPrintItem: PrintItemDto = {
    id: 1,
    titel: { en: "Print Title", nl: "Print Titel" },
    description: { en: "Print Desc", nl: "Print Beschrijving" },
    url: "https://example.com/print.pdf",
    created_at: "2026-03-28T14:00:00.000Z",
    updated_at: "2026-03-28T14:00:00.000Z",
  };

  beforeEach(async () => {
    const mockPrintDbService = {
      getAllPrintItems: jest.fn(),
      getPrintItemById: jest.fn(),
      createPrintItem: jest.fn(),
      updatePrintItem: jest.fn(),
      deletePrintItem: jest.fn(),
      linkPrintItemToGallery: jest.fn(),
      unlinkPrintItemFromGallery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrintItemService,
        {
          provide: PrintItemDatabaseService,
          useValue: mockPrintDbService,
        },
      ],
    }).compile();

    service = module.get<PrintItemService>(PrintItemService);
    printDbService = module.get(PrintItemDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getPrintItems", () => {
    it("should return a paginated list of print items", async () => {
      const paginationFilters: PaginationFilterDto = {
        page: 1,
        limit: 10,
        descending: true,
      };
      const expectedResponse: PaginatedResponse<PrintItemDto> = {
        objects: [mockPrintItem],
        totalItems: 1,
        page: 1,
        limit: 10,
      };

      printDbService.getAllPrintItems.mockResolvedValue(expectedResponse);

      const result = await service.getPrintItems(paginationFilters);

      expect(printDbService.getAllPrintItems).toHaveBeenCalledWith(
        paginationFilters,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getPrintItemById", () => {
    it("should return a single print item", async () => {
      printDbService.getPrintItemById.mockResolvedValue(mockPrintItem);

      const result = await service.getPrintItemById(1);

      expect(printDbService.getPrintItemById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPrintItem);
    });
  });

  describe("createPrintItem", () => {
    it("should create a print item with gallery_ids", async () => {
      const createItemDto: CreatePrintItemDto = {
        titel: { en: "Print Title", nl: "Print Titel" },
        description: { en: "Print Desc", nl: "Print Beschrijving" },
        url: "https://example.com/print.pdf",
        gallery_ids: [1, 2],
      };
      printDbService.createPrintItem.mockResolvedValue(mockPrintItem);

      const result = await service.createPrintItem(createItemDto);

      expect(printDbService.createPrintItem).toHaveBeenCalledWith(
        createItemDto,
        [1, 2],
      );
      expect(result).toEqual(mockPrintItem);
    });

    it("should default to empty array if gallery_ids are missing", async () => {
      const createItemDto: CreatePrintItemDto = {
        titel: { en: "Print Title", nl: "Print Titel" },
        description: { en: "Print Desc", nl: "Print Beschrijving" },
        url: "https://example.com/print.pdf",
      };
      printDbService.createPrintItem.mockResolvedValue(mockPrintItem);

      const result = await service.createPrintItem(createItemDto);

      expect(printDbService.createPrintItem).toHaveBeenCalledWith(createItemDto, []);
      expect(result).toEqual(mockPrintItem);
    });
  });

  describe("replacePrintItem", () => {
    it("should replace and return the print item", async () => {
      const replaceItemDto: ReplacePrintItemDto = {
        titel: { en: "New Title", nl: "Nieuwe Titel" },
        description: { en: "New Desc", nl: "Nieuwe Beschrijving" },
        url: "https://example.com/new.pdf",
      };
      printDbService.updatePrintItem.mockResolvedValue(mockPrintItem);

      const result = await service.replacePrintItem(1, replaceItemDto);

      expect(printDbService.updatePrintItem).toHaveBeenCalledWith(1, replaceItemDto);
      expect(result).toEqual(mockPrintItem);
    });
  });

  describe("modifyPrintItem", () => {
    it("should fetch the existing item, merge modifications, and update", async () => {
      const modifyItemDto: ModifyPrintItemDto = { url: "https://example.com/modified.pdf" };

      const expectedMergedItem: PrintItemDto = {
        ...mockPrintItem,
        ...modifyItemDto,
        id: 1,
      };

      printDbService.getPrintItemById.mockResolvedValue(mockPrintItem);
      printDbService.updatePrintItem.mockResolvedValue(expectedMergedItem);

      const result = await service.modifyPrintItem(1, modifyItemDto);

      expect(printDbService.getPrintItemById).toHaveBeenCalledWith(1);
      expect(printDbService.updatePrintItem).toHaveBeenCalledWith(
        1,
        expectedMergedItem,
      );
      expect(result).toEqual(expectedMergedItem);
    });
  });

  describe("deletePrintItem", () => {
    it("should delete the print item", async () => {
      printDbService.deletePrintItem.mockResolvedValue(undefined);

      await service.deletePrintItem(1);

      expect(printDbService.deletePrintItem).toHaveBeenCalledWith(1);
    });
  });

  describe("linkPrintItemToGallery", () => {
    it("should link a print item to a gallery", async () => {
      printDbService.linkPrintItemToGallery.mockResolvedValue(undefined);

      // Let op: service parameters zijn (printItemId, galleryId) 
      // DbService parameters zijn (galleryId, printItemId)
      await service.linkPrintItemToGallery(1, 2);

      expect(printDbService.linkPrintItemToGallery).toHaveBeenCalledWith(2, 1);
    });
  });

  describe("unlinkPrintItemFromGallery", () => {
    it("should unlink a print item from a gallery", async () => {
      printDbService.unlinkPrintItemFromGallery.mockResolvedValue(undefined);

      await service.unlinkPrintItemFromGallery(1, 2);

      expect(printDbService.unlinkPrintItemFromGallery).toHaveBeenCalledWith(2, 1);
    });
  });
});