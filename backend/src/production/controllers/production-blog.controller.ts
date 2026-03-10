import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProductionService } from "../production.service";
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import {
  BlogDto,
  BlogViewDto,
  LanguageQueryDto,
  ProductionDto,
} from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";
import { LanguageQuerySchema } from "@repo/common";
import { ZodValidationPipe } from "nestjs-zod";
import { LanguageService } from "../../util/language/language.service";
import { ApiOkArrayAnyOf } from "../../common/decorators/api.ok";

/**
 * Handles the Relationships between Productions and Blogs.
 */
@ApiTags("Production - Blog")
@Controller("productions/:productionId/blogs")
export class ProductionBlogController {
  constructor(
    private readonly productionService: ProductionService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to a GET to "/productions/:productionId/blogs".
   * @param productionId The id of the Production.
   * @returns A list of all Blog objects linked to this Production.
   */
  @ApiOperation({ summary: "Get all Blogs linked to a Production." })
  @ApiOkArrayAnyOf(BlogDto, BlogViewDto)
  @Get()
  async getProductionBlogs(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<BlogDto[] | BlogViewDto[]> {
    return this.ls.flattenByLanguage<BlogDto[] | BlogViewDto[]>(
      await this.productionService.getProductionBlogs(productionId),
      lang.lang,
    );
  }

  /**
   * Responds to a PUT to "/productions/:productionId/blogs/:blogId"
   * @param productionId ID of the Production.
   * @param blogId ID of the Blog.
   * @returns The newly linked Blog object.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
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
   * Responds to a DELETE to "/productions/:productionId/blogs/:blogId"
   * @param productionId ID of the Production.
   * @param blogId ID of the Blog.
   * @returns The Production we just unlinked the Blog from.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
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
