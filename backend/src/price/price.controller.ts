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
import { PriceService } from "./price.service";
import {
  CreatePriceDto,
  LanguageQueryDto,
  PaginationFilterDto,
  PriceDto,
  PriceViewDto,
  ModifyPriceDto,
  ReplacePriceDto,
} from "../dto/dto";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreatePriceSchema,
  LanguageQuerySchema,
  PaginatedResponse,
  PaginationFilterSchema,
  ModifyPriceSchema,
  ReplacePriceSchema,
} from "@repo/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";
import { LanguageService } from "../util/language/language.service";
import {
  ApiOkAnyOf,
  ApiOkPaginatedResponseAnyOf,
} from "../common/decorators/api.ok";

@Controller("prices")
export class PriceController {
  constructor(
    private readonly priceService: PriceService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to a GET to "/prices".
   * @param paginationFilter The Filter for pagination used.
   * @param lang The Filter for language.
   * @returns A list of Price objects.
   */
  @ApiOperation({ summary: "Fetches All Prices." })
  @ApiOkPaginatedResponseAnyOf(PriceDto, PriceViewDto)
  @Get()
  async getPrices(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<PaginatedResponse<PriceDto | PriceViewDto>> {
    return this.ls.flattenByLanguage<
      PaginatedResponse<PriceDto | PriceViewDto>
    >(await this.priceService.getPrices(paginationFilter), lang.lang);
  }

  /**
   * Responds to a GET to "/prices/:priceId"
   * @param priceId The ID of the Price we want to fetch.
   * @param lang The Language filter used.
   * @returns The specific Price if it exists.
   */
  @ApiOperation({ summary: "Fetches a specific Price." })
  @ApiOkAnyOf(PriceDto, PriceViewDto)
  @Get(":priceId")
  async getPriceById(
    @Param("priceId", ParseIntPipe) priceId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<PriceDto | PriceViewDto> {
    return this.ls.flattenByLanguage<PriceDto | PriceViewDto>(
      await this.priceService.getPriceById(priceId),
      lang.lang,
    );
  }

  /**
   * Responds to a POST to "/prices".
   * @param createPrice The Price object we want to create.
   * @returns The newly created Price.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new Price object." })
  @ApiBody({ type: CreatePriceDto })
  @ApiCreatedResponse({ type: PriceDto, description: "Created Price." })
  @UsePipes(new ZodValidationPipe(CreatePriceSchema))
  @Post()
  async createPrice(@Body() createPrice: CreatePriceDto): Promise<PriceDto> {
    return await this.priceService.createPrice(createPrice);
  }

  /**
   * Responds to a PUT to "/prices/:priceId"
   * @param priceId The ID of the price.
   * @param replacePrice The object to replace the price with.
   * @returns The resulting price.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces an existing Price object." })
  @ApiBody({ type: ReplacePriceDto })
  @ApiOkResponse({ type: PriceDto, description: "Replaced Price." })
  @Put(":priceId")
  async replacePrice(
    @Param("priceId", ParseIntPipe) priceId: number,
    @Body(new ZodValidationPipe(ReplacePriceSchema))
    replacePrice: ReplacePriceDto,
  ): Promise<PriceDto> {
    return await this.priceService.replacePrice(priceId, replacePrice);
  }

  /**
   * Responds to a PUT to "/prices".
   * @param priceId The ID of the Price.
   * @param modifyPrice The Price we want to update.
   * @returns The newly updated Price.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Updates an existing Price object." })
  @ApiBody({ type: ModifyPriceDto })
  @ApiOkResponse({ type: PriceDto, description: "Updated Price." })
  @Patch(":priceId")
  async modifyPrice(
    @Param("priceId", ParseIntPipe) priceId: number,
    @Body(new ZodValidationPipe(ModifyPriceSchema)) modifyPrice: ModifyPriceDto,
  ): Promise<PriceDto> {
    return await this.priceService.modifyPrice(priceId, modifyPrice);
  }

  /**
   * Responds to a DELETE to "/prices/:priceId".
   * @param priceId The ID of the Price we want to delete.
   * @returns Nothing.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an existing Price object." })
  @ApiOkResponse({ description: "Deleted Price." })
  @Delete(":priceId")
  async deletePrice(
    @Param("priceId", ParseIntPipe) priceId: number,
  ): Promise<void> {
    return await this.priceService.deletePrice(priceId);
  }
}
