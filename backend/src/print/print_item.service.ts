import { Injectable } from "@nestjs/common";
import { PrintItemDatabaseService } from "../database/db.print_item.service";
import {
  CreatePrintItemDto,
  ModifyPrintItemDto,
  PaginationFilterDto,
  PrintItemDto,
  ReplacePrintItemDto,
} from "../dto/dto";
import type { FilterPrintItemDto } from "../dto/dto";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class PrintItemService {
  constructor(private readonly printItemDbService: PrintItemDatabaseService) {}

  /**
   * Fetch a PrintItem object by its ID.
   * @param printItemId The ID of the PrintItem we want to fetch.
   * @returns A PrintItem object.
   */
  async getPrintItemById(printItemId: number): Promise<PrintItemDto> {
    return await this.printItemDbService.getPrintItemById(printItemId);
  }

  /**
   * Fetches all PrintItem objects from the database.
   * @param paginationFilter Filters for pagination and ordering.
   * @param printItemFilters The filters for the prints.
   * @returns All PrintItems.
   */
  async getPrintItems(
    paginationFilter: PaginationFilterDto,
    printItemFilters: FilterPrintItemDto,
  ): Promise<PaginatedResponse<PrintItemDto>> {
    return await this.printItemDbService.getAllPrintItems(
      paginationFilter,
      printItemFilters,
    );
  }

  /**
   * Creates a new PrintItem in the database.
   * @param createPrintItem The needed values to create a new PrintItem object.
   * @returns The newly created PrintItem object.
   */
  async createPrintItem(
    createPrintItem: CreatePrintItemDto,
  ): Promise<PrintItemDto> {
    return await this.printItemDbService.createPrintItem(createPrintItem);
  }

  /**
   * Replaces an existing PrintItem in the database.
   * @param printItemId The ID of the PrintItem.
   * @param replacePrintItem The object to replace the PrintItem with.
   * @returns The newly replaced object.
   */
  async replacePrintItem(
    printItemId: number,
    replacePrintItem: ReplacePrintItemDto,
  ): Promise<PrintItemDto> {
    return await this.printItemDbService.updatePrintItem(
      printItemId,
      replacePrintItem,
    );
  }

  /**
   * Updates an existing PrintItem in the database.
   * @param printItemId The ID of the PrintItem.
   * @param modifyPrintItem The object containing the fields to update the PrintItem with. All fields optional, only provided fields will be updated.
   * @returns The newly updated object.
   */
  async modifyPrintItem(
    printItemId: number,
    modifyPrintItem: ModifyPrintItemDto,
  ): Promise<PrintItemDto> {
    const existingPrintItem: PrintItemDto =
      await this.printItemDbService.getPrintItemById(printItemId);
    const mergedPrintItem: PrintItemDto = {
      ...existingPrintItem,
      ...modifyPrintItem,
      id: printItemId,
    };
    return await this.printItemDbService.updatePrintItem(
      printItemId,
      mergedPrintItem,
    );
  }

  /**
   * Deletes a single print item.
   * @param printItemId The ID of the print item to delete.
   */
  async deletePrintItem(printItemId: number): Promise<void> {
    await this.printItemDbService.deletePrintItem(printItemId);
  }
}
