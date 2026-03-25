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
import { ProductionService } from "../production.service";
import {
  CreateProductionSchema,
  FilterProductionSchema,
  LanguageQuerySchema,
  PaginatedResponse,
  PaginationFilterSchema,
  ProductionSchema,
  UpdateProductionSchema,
} from "@repo/common";
import {
  CreateProductionDto,
  FilterProductionDto,
  LanguageQueryDto,
  PaginationFilterDto,
  ProductionDto,
  ProductionViewDto,
  UpdateProductionDto,
} from "../../dto/dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../../auth/authGuard";
import { LanguageService } from "../../util/language/language.service";
import {
  ApiOkAnyOf,
  ApiOkPaginatedResponseAnyOf,
} from "../../common/decorators/api.ok";
import { ZodValidationPipe } from "nestjs-zod";

/**
 * Handles CORE functionality for Productions.
 */
@Controller("productions")
export class ProductionController {
  constructor(
    private readonly productionService: ProductionService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to GET /productions.
   * note: pagination is done here via the filters param.
   * @param lang The Language filter for this query.
   * @param paginationFilters Filters to do with the pagination and ordering of items.
   * @param productionFilters The Filters that should be applied to the query.
   * @returns All ProductionDto objects
   */
  @ApiOperation({ summary: "Returns all Production objects." })
  @ApiQuery({ name: "tag_ids", required: false, type: Number, isArray: true })
  @ApiOkPaginatedResponseAnyOf(ProductionDto, ProductionViewDto)
  @Get()
  async getAllProductions(
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilters: PaginationFilterDto,
    @Query(new ZodValidationPipe(FilterProductionSchema))
    productionFilters: FilterProductionDto,
  ): Promise<PaginatedResponse<ProductionDto | ProductionViewDto>> {
    return this.ls.flattenByLanguage<
      PaginatedResponse<ProductionDto | ProductionViewDto>
    >(
      await this.productionService.getAllProductions(
        productionFilters,
        paginationFilters,
      ),
      lang.lang,
    );
  }

  /**
   * Responds to GET /productions/:productionId.
   * @param productionId ID in the URL of the request.
   * @param lang is the used language
   * @returns The ProductionDto object with corresponding ID
   */
  @ApiOperation({ summary: "Returns the Production with id in the URL." })
  @ApiOkAnyOf(ProductionDto, ProductionViewDto)
  @Get(":productionId")
  async getProductionById(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<ProductionDto | ProductionViewDto> {
    return this.ls.flattenByLanguage<ProductionDto | ProductionViewDto>(
      await this.productionService.getProductionById(productionId),
      lang.lang,
    );
  }

  /**
   * Responds to a PUT to "/productions/:productionId".
   * @param productionId The ID in the URL.
   * @param production The parsed ProductionDto object.
   * @returns The newly updated ProductionDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces a Production." })
  @ApiBody({ type: ProductionDto })
  @ApiOkResponse({ type: ProductionDto, description: "Production Replaced." })
  @Put(":productionId")
  async replaceProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Body(new ZodValidationPipe(ProductionSchema)) production: ProductionDto,
  ): Promise<ProductionDto> {
    return await this.productionService.replaceProduction(
      productionId,
      production,
    );
  }

  /**
   * Responds to a PATCH to "/productions/:productionId".
   * @param productionId The ID in the URL.
   * @param patchData The parsed UpdateProductionDto object.
   * @returns The newly updated ProductionDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing Production." })
  @ApiBody({ type: UpdateProductionDto })
  @ApiOkResponse({ type: ProductionDto, description: "Production Modified." })
  @Patch(":productionId")
  async modifyProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Body(new ZodValidationPipe(UpdateProductionSchema))
    patchData: UpdateProductionDto,
  ): Promise<ProductionDto> {
    return await this.productionService.modifyProduction(
      productionId,
      patchData,
    );
  }

  /**
   * Responds to a DELETE to "/productions/:productionId".
   * @param productionId The ID in the URL.
   * @returns Nothing.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes a Production." })
  @ApiOkResponse({ description: "Production Deleted." })
  @Delete(":productionId")
  async deleteProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
  ): Promise<void> {
    return await this.productionService.deleteProduction(productionId);
  }

  /**
   * Responds to a POST to "/productions".
   * @param newProduction The new ProductionDto data we want to add
   * @returns The newly created ProductionDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new Production." })
  @ApiBody({ type: CreateProductionDto })
  @ApiOkResponse({ type: ProductionDto, description: "Production Created." })
  @Post()
  @UsePipes(new ZodValidationPipe(CreateProductionSchema))
  async createProduction(
    @Body() newProduction: CreateProductionDto,
  ): Promise<ProductionDto> {
    return await this.productionService.createProduction(newProduction);
  }
}
