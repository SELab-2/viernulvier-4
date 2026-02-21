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
import { ZodValidationPipe } from "src/common/pipes/zod.validation.pipe";
import { ProductionSchema, UpdateProductionSchema, CreateProductionSchema } from "@repo/common";
import type { Production, UpdateProduction, CreateProduction } from "@repo/common";

@Controller("production")
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to GET /productions
   * @returns All Production objects
   */
  @Get()
  async getAllProductions(): Promise<Production[]> {
    return await this.productionService.getAllProductions();
  }

  /**
   * Responds to GET /productions/:id
   * @param id ID in the URL of the request.
   * @returns The Production object with corresponding ID
   */
  @Get(":id")
  async getById(@Param("id", ParseIntPipe) id: number): Promise<Production> {
    return await this.productionService.getProductionById(id);
  }

  /**
   * Responds to a PUT to "/production/:id".
   * @param id The ID in the URL.
   * @param production The parsed Production object.
   * @returns The newly updated Production.
   */
  @Put(":id")
  @UsePipes(new ZodValidationPipe(ProductionSchema))
  async replaceProduction(
    @Param("id", ParseIntPipe) id: number,
    @Body() production: Production,
  ): Promise<Production> {
    return await this.productionService.replaceProduction(id, production);
  }

  /**
   * Responds to a PATCH to "/production/:id".
   * @param id The ID in the URL.
   * @param patchData The parsed UpdateProduction object.
   * @returns The newly updated Production.
   */
  @Patch(":id")
  @UsePipes(new ZodValidationPipe(UpdateProductionSchema))
  async modifyProduction(
    @Param("id", ParseIntPipe) id: number,
    @Body() patchData: UpdateProduction,
  ): Promise<Production> {
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
   * @param newProduction The new Production data we want to add
   * @returns The newly created Production.
   */
  @Post()
  @UsePipes(new ZodValidationPipe(CreateProductionSchema))
  async createProduction(
    @Body() newProduction: CreateProduction,
  ): Promise<Production> {
    return this.productionService.createProduction(newProduction);
  }
}
