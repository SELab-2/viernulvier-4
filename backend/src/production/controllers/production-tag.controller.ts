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
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import {
  LanguageQueryDto,
  ProductionDto,
  TagDto,
  TagViewDto,
} from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";
import { DbService } from "src/database/db.service";
import { LanguageQuerySchema } from "@repo/common";
import { ZodValidationPipe } from "nestjs-zod";

/**
 * Handles the Relationships between Productions and Tags.
 */
@ApiTags("Production - Tag")
@Controller("productions/:productionId/tags")
export class ProductionTagController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to GET /productions/:productionId/tags
   * @param productionId ID in the URL of the request.
   * @returns The list of Tag objects for the Production
   */
  @ApiOperation({
    summary: "Returns the Tags of the Production with id in the URL.",
  })
  @ApiExtraModels(TagViewDto, TagDto)
  @ApiOkResponse({
    description: "Tags Found.",
    schema: {
      anyOf: [
        {
          type: "array",
          items: { $ref: getSchemaPath(TagViewDto) },
        },
        {
          type: "array",
          items: { $ref: getSchemaPath(TagDto) },
        },
      ],
    },
  })
  @Get()
  async getTagsOfProductionByID(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<TagDto[] | TagViewDto[]> {
    return DbService.flattenTranslation<TagDto[] | TagViewDto[]>(
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
