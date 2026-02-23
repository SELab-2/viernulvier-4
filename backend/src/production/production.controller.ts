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
import type { ProductionDto, UpdateProductionDto, CreateProductionDto } from "../dto/dto";

@Controller("production")
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to GET /productions
   * @returns All ProductionDto objects
   */
  @Get()
  async getAllProductions(): Promise<ProductionDto[]> {
    return await this.productionService.getAllProductions();
  }

  /**
   * Responds to GET /productions/:id
   * @param id ID in the URL of the request.
   * @returns The ProductionDto object with corresponding ID
   */
  @Get(":id")
  async getById(@Param("id", ParseIntPipe) id: number): Promise<ProductionDto> {
    return await this.productionService.getProductionById(id);
  }

  /**
   * Responds to a PUT to "/production/:id".
   * @param id The ID in the URL.
   * @param production The parsed ProductionDto object.
   * @returns The newly updated ProductionDto.
   */
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
  @Delete(":id")
  async deleteProduction(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.productionService.deleteProduction(id);
  }

  /**
   * Responds to a POST to "/production/".
   * @param newProduction The new ProductionDto data we want to add
   * @returns The newly created ProductionDto.
   */
  @Post()
  @UsePipes(new ZodValidationPipe(CreateProductionSchema))
  async createProduction(
    @Body() newProduction: CreateProductionDto,
  ): Promise<ProductionDto> {
    return this.productionService.createProduction(newProduction);
  }
}
