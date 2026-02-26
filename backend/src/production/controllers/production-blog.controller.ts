import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from "@nestjs/common";
import { ProductionService } from "../production.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { BlogDto, ProductionDto } from "../../dto/dto";

/**
 * Handles the Relationships between Productions and Blogs.
 */
@ApiTags("Production - Blog")
@Controller("production/:productionId/blog")
export class ProductionBlogController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to a GET to "/production/:productionId/blog".
   * @param id The id of the Production.
   * @returns A list of all Blog objects linked to this Production.
   */
  @ApiOperation({ summary: "Get all Blogs linked to a Production." })
  @ApiOkResponse({
    type: BlogDto,
    isArray: true,
    description: "Returned all Linked blogs.",
  })
  @Get()
  async getProductionBlogs(
    @Param("productionId", ParseIntPipe) productionId: number,
  ): Promise<BlogDto[]> {
    return await this.productionService.getProductionBlogs(productionId);
  }

  /**
   * Responds to a PUT to "/production/:productionId/blog/:blogId"
   * @param productionId ID of the Production.
   * @param blogId ID of the Blog.
   * @returns The newly linked Blog object.
   */
  @ApiOperation({ summary: "Link a Blog to an existing Production." })
  @ApiOkResponse({ type: BlogDto, description: "Linked Blog to Production." })
  @Put(":blogId")
  async linkBlogToProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Param("blogId", ParseIntPipe) blogId: number,
  ): Promise<BlogDto> {
    return await this.productionService.linkBlogToProduction(
      productionId,
      blogId,
    );
  }

  /**
   * Responds to a DELETE to "/production/:productionId/blog/:blogId"
   * @param productionId ID of the Production.
   * @param blogId ID of the Blog.
   * @returns The Production we just unlinked the Blog from.
   */
  @ApiOperation({ summary: "Unlink a Blog from an existing Production." })
  @ApiOkResponse({
    type: ProductionDto,
    description: "Unlinked Blog from Production.",
  })
  @Delete(":blogId")
  async unlinkBlogFromProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Param("blogId", ParseIntPipe) blogId: number,
  ): Promise<ProductionDto> {
    return await this.productionService.unlinkBlogFromProduction(
      productionId,
      blogId,
    );
  }
}
