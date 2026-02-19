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
import { ProductionsService } from "./productions.service";
import { ZodValidationPipe } from "src/common/pipes/zod.validation.pipe";
import { ProductionSchema, UpdateProductionSchema, CreateProductionSchema } from "@repo/common";
import type { Production, UpdateProduction, CreateProduction } from "@repo/common";

@Controller("productions")
export class ProductionsController {
  constructor(private readonly productionsService: ProductionsService) {}

  // GET /productions
  @Get()
  getAll(): string[] {
    return this.productionsService.getAll();
  }

  // GET /productions/:id
  @Get(":id")
  getById(@Param("id") id: string): string {
    return this.productionsService.getById(id);
  }

  /**
   * Responds to a PUT to "/productions/:id".
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
    return await this.productionsService.replaceProduction(id, production);
  }

  /**
   * Responds to a PATCH to "/productions/:id".
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
    return await this.productionsService.modifyProduction(id, patchData);
  }

  /**
   * Responds to a DELETE to "/productions/:id".
   * @param id The ID in the URL.
   * @returns Nothing.
   */
  @Delete(":id")
  async deleteProduction(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.productionsService.deleteProduction(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateProductionSchema))
  async createProduction(
    @Body() newProduction: CreateProduction,
  ): Promise<Production> {
    return this.productionsService.createProduction(newProduction);
  }
}
