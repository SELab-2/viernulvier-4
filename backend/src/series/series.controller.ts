import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SeriesService } from "./series.service";
import {
  CreateSeriesDto,
  FilterSeriesDto,
  LanguageQueryDto,
  ModifySeriesDto,
  PaginationFilterDto,
  ProductionDto,
  ProductionViewDto,
  ReplaceSeriesDto,
  SeriesDto,
  SeriesViewDto,
} from "../dto/dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateSeriesSchema,
  FilterSeriesSchema,
  LanguageQuerySchema,
  ModifySeriesSchema,
  PaginatedResponse,
  PaginationFilterSchema,
  ReplaceSeriesSchema,
} from "@repo/common";
import { LanguageService } from "../util/language/language.service";
import {
  ApiOkAnyOf,
  ApiOkPaginatedResponseAnyOf,
} from "../common/decorators/api.ok";

@Controller("series")
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to GET /series
   * @param lang is the language filter
   * @param paginationFilter is the pagination parameters.
   * @param seriesFilters filtering for series.
   * @returns Paginated SeriesDto objects
   */
  @ApiOperation({ summary: "Returns a paginated list of Series." })
  @ApiOkPaginatedResponseAnyOf(SeriesDto, SeriesViewDto)
  @Get()
  async getSeries(
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
    @Query(new ZodValidationPipe(FilterSeriesSchema))
    seriesFilters: FilterSeriesDto,
  ): Promise<PaginatedResponse<SeriesDto | SeriesViewDto>> {
    return this.ls.flattenByLanguage<
      PaginatedResponse<SeriesDto | SeriesViewDto>
    >(
      await this.seriesService.getSeries(
        paginationFilter,
        seriesFilters,
        lang.lang,
      ),
      lang.lang,
    );
  }

  /**
   * Responds to GET /series/:seriesId
   * @param seriesId ID in the URL of the request.
   * @param lang is the Language filter
   * @returns The SeriesDto object with corresponding ID
   */
  @ApiOperation({ summary: "Returns the Series with id in the URL." })
  @ApiOkAnyOf(SeriesDto, SeriesViewDto)
  @Get(":seriesId")
  async getSeriesById(
    @Param("seriesId", ParseIntPipe) seriesId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<SeriesDto | SeriesViewDto> {
    return this.ls.flattenByLanguage<SeriesDto | SeriesViewDto>(
      await this.seriesService.getSeriesById(seriesId),
      lang.lang,
    );
  }

  /**
   * Responds to a POST to "/series".
   * @param createSeries The new SeriesDto data we want to add
   * @returns The newly created SeriesDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new Series." })
  @ApiBody({ type: CreateSeriesDto })
  @ApiOkResponse({ type: SeriesDto, description: "Series Created." })
  @Post()
  async createSeries(
    @Body(new ZodValidationPipe(CreateSeriesSchema))
    createSeries: CreateSeriesDto,
  ): Promise<SeriesDto> {
    return await this.seriesService.createSeries(createSeries);
  }

  /**
   * Responds to a PUT to "/series/:seriesId".
   * @param seriesId The ID in the URL.
   * @param replaceSeries parsed ReplaceSeriesDto object.
   * @returns The newly updated SeriesDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces an existing Series." })
  @ApiBody({ type: ReplaceSeriesDto })
  @ApiOkResponse({ type: SeriesDto, description: "Series Replaced." })
  @Put(":seriesId")
  async replaceSeries(
    @Param("seriesId", ParseIntPipe) seriesId: number,
    @Body(new ZodValidationPipe(ReplaceSeriesSchema))
    replaceSeries: ReplaceSeriesDto,
  ): Promise<SeriesDto> {
    return await this.seriesService.updateSeries(seriesId, replaceSeries);
  }

  /**
   * Responds to a PATCH to "/series/:seriesId".
   * @param seriesId The ID in the URL.
   * @param modifySeries The parsed ModifySeriesDto object.
   * @returns The newly updated SeriesDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing Series." })
  @ApiBody({ type: ModifySeriesDto })
  @ApiOkResponse({ type: SeriesDto, description: "Series Modified." })
  @Patch(":seriesId")
  async modifySeries(
    @Param("seriesId", ParseIntPipe) seriesId: number,
    @Body(new ZodValidationPipe(ModifySeriesSchema))
    modifySeries: ModifySeriesDto,
  ): Promise<SeriesDto> {
    return await this.seriesService.updateSeries(seriesId, modifySeries);
  }

  /**
   * Responds to a DELETE to "/series/:seriesId".
   * @param seriesId The ID in the URL.
   * @returns A confirmation message.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes a Series." })
  @ApiOkResponse({ description: "Series Deleted." })
  @Delete(":seriesId")
  async deleteSeries(@Param("seriesId", ParseIntPipe) seriesId: number) {
    await this.seriesService.deleteSeries(seriesId);
  }

  // ====================================================================
  // Productions Sub-routes
  // ====================================================================

  /**
   * Responds to GET /series/:seriesId/productions
   * @param seriesId ID in the URL of the request.
   * @param lang is the desired language.
   * @param paginationFilters is the pagination filters.
   * @returns An array of ProductionDto objects linked to the series.
   */
  @ApiOperation({ summary: "Returns all Productions linked to a Series." })
  @ApiOkPaginatedResponseAnyOf(ProductionDto, ProductionViewDto)
  @Get(":seriesId/productions")
  async getSeriesProductions(
    @Param("seriesId", ParseIntPipe) seriesId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<ProductionDto | ProductionViewDto>> {
    return this.ls.flattenByLanguage<
      PaginatedResponse<ProductionDto | ProductionViewDto>
    >(
      await this.seriesService.getSeriesProductions(
        seriesId,
        paginationFilters,
      ),
      lang.lang,
    );
  }

  /**
   * Responds to POST /series/:seriesId/productions
   * @param seriesId ID in the URL of the request.
   * @param productionIds Array of production IDs to link.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Links a list of productions to a Series." })
  @ApiBody({ schema: { example: [1, 2, 3] } })
  @ApiOkResponse({ description: "Productions successfully linked." })
  @Put(":seriesId/productions")
  async linkProductionsToSeries(
    @Param("seriesId", ParseIntPipe) seriesId: number,
    @Body(new ParseArrayPipe({ items: Number })) productionIds: number[],
  ) {
    await this.seriesService.linkProductionsToSeries(seriesId, productionIds);
  }

  /**
   * Responds to DELETE /series/:seriesId/productions/:productionId
   * @param seriesId The ID of the series.
   * @param productionId The ID of the production to unlink.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Unlinks a single production from a Series." })
  @ApiOkResponse({ description: "Production successfully unlinked." })
  @Delete(":seriesId/productions/:productionId")
  async unlinkProductionFromSeries(
    @Param("seriesId", ParseIntPipe) seriesId: number,
    @Param("productionId", ParseIntPipe) productionId: number,
  ) {
    await this.seriesService.unlinkProductionFromSeries(seriesId, productionId);
  }
}
