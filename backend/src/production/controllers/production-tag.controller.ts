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
  LanguageQueryDto,
  ProductionDto,
  TagDto,
  TagViewDto,
} from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";
import { LanguageQuerySchema } from "@repo/common";
import { ZodValidationPipe } from "nestjs-zod";
import { LanguageService } from "../../util/language/language.service";
import { ApiOkArrayAnyOf } from "../../common/decorators/api.ok";

/**
 * Handles the Relationships between Productions and Tags.
 */
@ApiTags("Production - Tag")
@Controller("productions/:productionId/tags")
export class ProductionTagController {
  constructor(
    private readonly productionService: ProductionService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to GET /productions/:productionId/tags
   * @param productionId ID in the URL of the request.
   * @param lang is the desired language.
   * @returns The list of Tag objects for the Production
   */
  @ApiOperation({
    summary: "Returns the Tags of the Production with id in the URL.",
  })
  @ApiOkArrayAnyOf(TagDto, TagViewDto)
  @Get()
  async getTagsOfProductionByID(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<TagDto[] | TagViewDto[]> {
    return this.ls.flattenByLanguage<TagDto[] | TagViewDto[]>(
      await this.productionService.getTagsById(productionId),
      lang.lang,
    );
  }

  /**
   * Responds to PUT to "/productions/:productionId/tags/:tagId".
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns The altered Production.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Adds a Tag to a Production." })
  @ApiOkResponse({
    type: ProductionDto,
    description: "Successfully added Tag to Production.",
  })
  @Put(":tagId")
  async addTagToProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Param("tagId", ParseIntPipe) tagId: number,
  ): Promise<ProductionDto> {
    return await this.productionService.addTagToProduction(productionId, tagId);
  }

  /**
   * Responds to a DELETE to "/productions/:productionId/tags/:tagId".
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns The altered Production.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Removes a Tag from a Production." })
  @ApiOkResponse({
    type: ProductionDto,
    description: "Successfully removed Tag from Production.",
  })
  @Delete(":tagId")
  async removeTagFromProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Param("tagId", ParseIntPipe) tagId: number,
  ): Promise<ProductionDto> {
    return await this.productionService.removeTagFromProduction(
      productionId,
      tagId,
    );
  }
}
