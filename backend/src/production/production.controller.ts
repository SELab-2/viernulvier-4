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
import type { Production, UpdateProduction, CreateProduction, Blog } from "@repo/common";

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
  async replaceProduction(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(ProductionSchema)) production: Production,
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
  async modifyProduction(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateProductionSchema)) patchData: UpdateProduction,
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

  // -- BLOGS -- //

  /**
   * Responds to a GET to "/:id/blog".
   * @param id The id of the Production.
   * @returns A list of all Blog objects linked to this Production.
   */
  @Get(":id/blog")
  async getProductionBlogs(@Param("id", ParseIntPipe) id: number): Promise<Blog[]> {
    return await this.productionService.getProductionBlogs(id);
  }

  /**
   * Responds to a PUT to "/:id/blog/:id2"
   * @param productionId ID of the Production.
   * @param blogId ID of the Blog.
   * @returns The newly linked Blog object.
   */
  @Put(":id/blog/:id2")
  async linkBlogToProduction(
    @Param("id", ParseIntPipe) productionId: number,
    @Param("id2", ParseIntPipe) blogId: number,
  ): Promise<Blog> {
    return await this.productionService.linkBlogToProduction(productionId, blogId)
  }

  /**
   * Responds to a DELETE to "/:id/blog/:id2"
   * @param productionId ID of the Production.
   * @param blogId ID of the Blog.
   * @returns The Production we just unlinked the Blog from.
   */
  @Delete(":id/blog/:id2")
  async unlinkBlogFromEvent(
    @Param("id", ParseIntPipe) productionId: number,
    @Param("id2", ParseIntPipe) blogId: number
  ): Promise<Production> {
    return await this.productionService.unlinkBlogFromProduction(productionId, blogId);
  }
}
