import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch, Post,
  Put,
  UsePipes,
} from "@nestjs/common";
import { ProductionService } from "./production.service";
import { ZodValidationPipe } from "../common/pipes/zod.validation.pipe";
import { ProductionSchema, UpdateProductionSchema, CreateProductionSchema } from "@repo/common";
import { ProductionDto, UpdateProductionDto, CreateProductionDto, TagDto } from "../dto/dto";
import { ApiBody, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

@Controller("production")
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to GET /productions
   * @returns All ProductionDto objects
   */
  @ApiOperation({ summary: "Returns all Production objects." })
  @ApiOkResponse({ type: ProductionDto, isArray: true, description: "All Productions returned." })
  @Get()
  async getAllProductions(): Promise<ProductionDto[]> {
    return await this.productionService.getAllProductions();
  }

  /**
   * Responds to GET /productions/:id
   * @param id ID in the URL of the request.
   * @returns The ProductionDto object with corresponding ID
   */
  @ApiOperation({ summary: "Returns the Production with id in the URL." })
  @ApiOkResponse({ type: ProductionDto, description: "Production Found." })
  @Get(":id")
  async getProductionById(@Param("id", ParseIntPipe) id: number): Promise<ProductionDto> {
    return await this.productionService.getProductionById(id);
  }

  /**
   * Responds to GET /productions/:id/tags
   * @param id ID in the URL of the request.
   * @returns The list of Tag objects for the Production
   */
  @ApiOperation({ summary: "Returns the Tags of the Production with id in the URL." })
  @ApiOkResponse({ type: TagDto, isArray: true, description: "Tags Found." })
  @Get(":id/tags")
  async getTagsOfProductionByID(@Param("id", ParseIntPipe) id: number): Promise<TagDto[]> {
    return await this.productionService.getTagsById(id);
  }

  /**
   * Responds to a PUT to "/production/:id".
   * @param id The ID in the URL.
   * @param production The parsed ProductionDto object.
   * @returns The newly updated ProductionDto.
   */
  @ApiOperation({ summary: "Replaces a Production." })
  @ApiBody({ type: ProductionDto })
  @ApiOkResponse({ type: ProductionDto, description: "Production Replaced." })
  @Put(":id")
  async replaceProduction(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(ProductionSchema)) production: ProductionDto,
  ): Promise<ProductionDto> {
    return await this.productionService.replaceProduction(id, production);
  }

  /**
   * Responds to a PATCH to "/production/:id".
   * @param id The ID in the URL.
   * @param patchData The parsed UpdateProductionDto object.
   * @returns The newly updated ProductionDto.
   */
  @ApiOperation({ summary: "Modifies an existing Production." })
  @ApiBody({ type: UpdateProductionDto })
  @ApiOkResponse({ type: ProductionDto, description: "Production Modified." })
  @Patch(":id")
  async modifyProduction(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateProductionSchema)) patchData: UpdateProductionDto,
  ): Promise<ProductionDto> {
    return await this.productionService.modifyProduction(id, patchData);
  }

  /**
   * Responds to a DELETE to "/production/:id".
   * @param id The ID in the URL.
   * @returns Nothing.
   */
  @ApiOperation({ summary: "Deletes a Production." })
  @ApiOkResponse({ description: "Production Deleted." })
  @Delete(":id")
  async deleteProduction(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.productionService.deleteProduction(id);
  }

  /**
   * Responds to a POST to "/production/".
   * @param newProduction The new ProductionDto data we want to add
   * @returns The newly created ProductionDto.
   */
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
