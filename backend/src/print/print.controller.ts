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
} from "@nestjs/common";
import { PrintService } from '../database/db.print.service';
import {
    CreatePrintItemSchema,
    LanguageQuerySchema,
    PaginatedResponse,
    ModifyPrintItemSchema,
    PaginationFilterSchema,
    ReplacePrintItemSchema,
} from "@repo/common";
import {
  PrintDto,
  LanguageQueryDto,
  CreatePrintDto,
  ModifyPrintDto,
  ReplacePrintDto,
  PaginationFilterDto,
  PrintItemViewDto,
} from '../dto/dto';
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

/**
 * Defines all print item related endpoints.
 */
@ApiTags("Prints - Items")
@Controller("items")
export class PrintController {
  constructor(
    private readonly printService: PrintService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to a GET to "/prints".
   * @param paginationFilter The Filters for pagination and ordering.
   * @param lang The Language Query.
   * @returns A paginated list of print items.
   */
  @ApiOperation({ summary: "Fetch a paginated list of prints." })
  @ApiOkPaginatedResponseAnyOf(PrintDto, PrintViewDto)
  @Get()
  async getPrints(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
): Promise<PaginatedResponse<PrintDto | PrintViewDto>> {
    return this.ls.flattenByLanguage<
        PaginatedResponse<PrintDto | PrintViewDto>
    >(this.printService.getPrints(paginationFilter), lang.lang);
  }

  /**
   * Responds to a GET to "/prints/:printId".
   * @param printId The ID of the print item we want to fetch.
   * @param lang The Language Query.
   * @returns The specific Print if it exists.
   */
  @ApiOperation({ summary: "Fetches a specific print item."})
  @ApiOkAnyOf(PrintDto, PrintViewDto)
  @Get(':printId')
  async getPrintById(
    @Param('printId', ParseIntPipe) printId: number
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
): Promise<PrintDto | PrintViewDto>    {
    return this.ls.flattenByLanguage<PrintDto | PrintViewDto>(
        await this.printService.getPrintById(printId),
        lang.lang,
    );
  }

  /**
   * Responds to a POST to "/prints".
   * @param createPrint The Print object we want to create.
   * @returns The newly created Price.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new Print object." })
  @ApiBody({ type: CreatePrintDto })
  @ApiCreatedResponse({ type: PrintDto, description: "Created Print." })
  @UsePipes(new ZodValidationPipe(CreatePrintSchema))
  @Post()
  async createPrint(@Body() createPrint: CreatePrintDto): Promise<PrintDto> {
    return await this.printService.createPrint(createPrint);
  }

  /**
   * Responds to a PUT to "/prints/:printId".
   * @param printId The ID of the print.
   * @param replacePrint The object to replace the print with.
   * @returns The resulting print.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces an existing Print object." })
  @ApiBody({ type: ReplacePrintDto })
  @ApiOkResponse({ type: PrintDto, description: "Replaced Print." })
  @Put(':printId')
  async replacePrint(
    @Param('printId', ParseIntPipe) printId: number,
    @Body(new ZodValidationPipe(ReplacePrintSchema))
    replacePrint: ReplacePrintDto,
  ): Promise<PrintDto> {
    return this.printService.replacePrint(printId, replacePrint);
  }

  /**
   * Responds to a PUT to "/prints".
   * @param printId The ID of the Print.
   * @param modifyPrint The Print we want to update.
   * @returns The newly updated Print.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Updates an existing Print object." })
  @ApiBody({ type: ModifyPrintDto })
  @ApiOkResponse({ type: PrintDto, description: "Updated Print." })
  @Patch(':printId')
  async modifyPrint(
    @Param('printId', ParseIntPipe) printId: number,
    @Body(new ZodValidationPipe(ModifyPrintSchema)) modifyPrint: ModifyPrintDto,
  ): Promise<PrintDto> {
    return this.printService.updateItem(printId, modifyPrint);
  }

  /**
   * Responds to a DELETE to "/prints/:printId".
   * @param printId The ID of the print we want to delete.
   * @returns Nothing.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an existing Print object." })
  @ApiOkResponse({ description: "Print deleted successfully." })
  @Delete(':printId')
  async deletePrint(
    @Param('printId', ParseIntPipe) printId: number,
  ): Promise<void> {
    await this.printService.deleteItem(printId);
  }
}