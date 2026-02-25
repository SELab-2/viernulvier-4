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
import { ProductionDto, UpdateProductionDto, CreateProductionDto, BlogDto } from "../dto/dto";
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
  async getById(@Param("id", ParseIntPipe) id: number): Promise<ProductionDto> {
    return await this.productionService.getProductionById(id);
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

  // -- BLOGS -- //

  /**
   * Responds to a GET to "/:id/blog".
   * @param id The id of the Production.
   * @returns A list of all Blog objects linked to this Production.
   */
  @ApiOperation({ summary: "Get all Blogs linked to a Production." })
  @ApiOkResponse({ type: BlogDto, isArray: true, description: "Returned all Linked blogs." })
  @Get(":id/blog")
  async getProductionBlogs(@Param("id", ParseIntPipe) id: number): Promise<BlogDto[]> {
    return await this.productionService.getProductionBlogs(id);
  }

  /**
   * Responds to a PUT to "/:id/blog/:id2"
   * @param productionId ID of the Production.
   * @param blogId ID of the Blog.
   * @returns The newly linked Blog object.
   */
  @ApiOperation({ summary: "Link a Blog to an existing Production." })
  @ApiOkResponse({ type: BlogDto, description: "Linked Blog to Production." })
  @Put(":id/blog/:id2")
  async linkBlogToProduction(
    @Param("id", ParseIntPipe) productionId: number,
    @Param("id2", ParseIntPipe) blogId: number,
  ): Promise<BlogDto> {
    return await this.productionService.linkBlogToProduction(productionId, blogId)
  }

  /**
   * Responds to a DELETE to "/:id/blog/:id2"
   * @param productionId ID of the Production.
   * @param blogId ID of the Blog.
   * @returns The Production we just unlinked the Blog from.
   */
  @ApiOperation({ summary: "Unlink a Blog from an existing Production." })
  @ApiOkResponse({ type: ProductionDto, description: "Unlinked Blog from Production." })
  @Delete(":id/blog/:id2")
  async unlinkBlogFromEvent(
    @Param("id", ParseIntPipe) productionId: number,
    @Param("id2", ParseIntPipe) blogId: number
  ): Promise<ProductionDto> {
    return await this.productionService.unlinkBlogFromProduction(productionId, blogId);
  }
}
