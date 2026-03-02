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
import { ZodValidationPipe } from "../../common/pipes/zod.validation.pipe";
import {
  CreateProductionSchema,
  FilterProductionSchema,
  ProductionSchema,
  UpdateProductionSchema,
} from "@repo/common";
import { CreateProductionDto, FilterProductionDto, ProductionDto, UpdateProductionDto, } from "../../dto/dto";
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiSecurity, } from "@nestjs/swagger";
import { ApiKeyGuard } from "../../auth/authGuard";

/**
 * Handles CORE functionality for Productions.
 */
@Controller("production")
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to GET /productions
   * @param filters The Filters that should be applied to the query.
   * @returns All ProductionDto objects
   */
  @ApiOperation({ summary: "Returns all Production objects." })
  @ApiQuery({ name: "tag_ids", required: false, type: Number, isArray: true })
  @ApiOkResponse({
    type: ProductionDto,
    isArray: true,
    description: "All Productions returned.",
  })
  @Get()
  @UsePipes(new ZodValidationPipe(FilterProductionSchema))
  async getAllProductions(
    @Query() filters: FilterProductionDto,
  ): Promise<ProductionDto[]> {
    return await this.productionService.getAllProductions(filters);
  }

  /**
   * Responds to GET /productions/:productionId
   * @param productionId ID in the URL of the request.
   * @returns The ProductionDto object with corresponding ID
   */
  @ApiOperation({ summary: "Returns the Production with id in the URL." })
  @ApiOkResponse({ type: ProductionDto, description: "Production Found." })
  @Get(":productionId")
  async getProductionById(
    @Param("productionId", ParseIntPipe) productionId: number,
  ): Promise<ProductionDto> {
    return await this.productionService.getProductionById(productionId);
  }

  /**
   * Responds to a PUT to "/production/:productionId".
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
   * Responds to a PATCH to "/production/:productionId".
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
   * Responds to a DELETE to "/production/:productionId".
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
   * Responds to a POST to "/production".
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
    return this.productionService.createProduction(newProduction);
  }
}
