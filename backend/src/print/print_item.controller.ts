import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { PrintItemService } from "./print_item.service";
import {
  CreatePrintItemSchema,
  LanguageQuerySchema,
  PaginatedResponse,
  ModifyPrintItemSchema,
  PaginationFilterSchema,
  ReplacePrintItemSchema,
} from "@repo/common";
import {
  PrintItemDto,
  LanguageQueryDto,
  CreatePrintItemDto,
  ModifyPrintItemDto,
  ReplacePrintItemDto,
  PaginationFilterDto,
  PrintItemViewDto,
  PrintType,
} from "../dto/dto";
import { LanguageService } from "../util/language/language.service";
import { ZodValidationPipe } from "nestjs-zod";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import {
  ApiOkAnyOf,
  ApiOkPaginatedResponseAnyOf,
} from "../common/decorators/api.ok";
import { ApiKeyGuard } from "../auth/authGuard";
import { ApiQuery } from "@nestjs/swagger";

/**
 * Defines all print item related endpoints.
 */
@ApiTags("Prints - Items")
@Controller("prints")
export class PrintItemController {
  constructor(
    private readonly printItemService: PrintItemService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to a GET to "/prints".
   * @param paginationFilter The Filters for pagination and ordering.
   * @param lang The Language Query.
   * @returns A paginated list of print items.
   */
  @ApiOperation({ summary: "Fetch a paginated list of print items." })
  @ApiQuery({
    name: "type",
    enum: PrintType,
    required: false,
    description: "Filter by print type.",
  })
  @ApiOkPaginatedResponseAnyOf(PrintItemDto, PrintItemViewDto)
  @Get()
  async getPrintItems(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
    @Query("type") print_type?: PrintType,
  ): Promise<PaginatedResponse<PrintItemDto | PrintItemViewDto>> {
    return this.ls.flattenByLanguage<
      PaginatedResponse<PrintItemDto | PrintItemViewDto>
    >(
      await this.printItemService.getPrintItems(paginationFilter, print_type),
      lang.lang,
    );
  }

  /**
   * Responds to a GET to "/prints/:printItemId".
   * @param printItemId The ID of the print item we want to fetch.
   * @param lang The Language Query.
   * @returns The specific print item if it exists.
   */
  @ApiOperation({ summary: "Fetches a specific print item." })
  @ApiOkAnyOf(PrintItemDto, PrintItemViewDto)
  @Get(":printItemId")
  async getPrintItemById(
    @Param("printItemId", ParseIntPipe) printItemId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<PrintItemDto | PrintItemViewDto> {
    return this.ls.flattenByLanguage<PrintItemDto | PrintItemViewDto>(
      await this.printItemService.getPrintItemById(printItemId),
      lang.lang,
    );
  }

  /**
   * Responds to a POST to "/prints".
   * @param createPrintItem The print item object we want to create.
   * @returns The newly created print item.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new print item object." })
  @ApiBody({ type: CreatePrintItemDto })
  @ApiCreatedResponse({
    type: PrintItemDto,
    description: "Created print item.",
  })
  @UsePipes(new ZodValidationPipe(CreatePrintItemSchema))
  @Post()
  async createPrintItem(
    @Body() createPrintItem: CreatePrintItemDto,
  ): Promise<PrintItemDto> {
    return await this.printItemService.createPrintItem(createPrintItem);
  }

  /**
   * Responds to a PUT to "/prints/:printItemId".
   * @param printItemId The ID of the print item.
   * @param replacePrintItem The object to replace the print item with.
   * @returns The resulting print item.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces an existing print item object." })
  @ApiBody({ type: ReplacePrintItemDto })
  @ApiOkResponse({ type: PrintItemDto, description: "Replaced print item." })
  @Put(":printItemId")
  async replacePrintItem(
    @Param("printItemId", ParseIntPipe) printItemId: number,
    @Body(new ZodValidationPipe(ReplacePrintItemSchema))
    replacePrintItem: ReplacePrintItemDto,
  ): Promise<PrintItemDto> {
    return this.printItemService.replacePrintItem(
      printItemId,
      replacePrintItem,
    );
  }

  /**
   * Responds to a PATCH to "/prints/:printItemId".
   * @param printItemId The ID of the print item.
   * @param modifyPrintItem The print item we want to update.
   * @returns The newly updated print item.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Updates an existing print item object." })
  @ApiBody({ type: ModifyPrintItemDto })
  @ApiOkResponse({ type: PrintItemDto, description: "Updated print item." })
  @Patch(":printItemId")
  async modifyPrintItem(
    @Param("printItemId", ParseIntPipe) printItemId: number,
    @Body(new ZodValidationPipe(ModifyPrintItemSchema))
    modifyPrintItem: ModifyPrintItemDto,
  ): Promise<PrintItemDto> {
    return this.printItemService.modifyPrintItem(printItemId, modifyPrintItem);
  }

  /**
   * Responds to a DELETE to "/prints/:printItemId".
   * @param printItemId The ID of the print item we want to delete.
   * @returns Nothing.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an existing print item object." })
  @ApiOkResponse({ description: "print item deleted successfully." })
  @Delete(":printItemId")
  async deletePrintItem(
    @Param("printItemId", ParseIntPipe) printItemId: number,
  ): Promise<void> {
    await this.printItemService.deletePrintItem(printItemId);
  }
}
