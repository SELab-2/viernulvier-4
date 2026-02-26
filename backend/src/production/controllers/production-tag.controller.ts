import { Controller, Delete, Get, Param, ParseIntPipe, Put } from "@nestjs/common";
import { ProductionService } from "../production.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProductionDto, TagDto } from "../../dto/dto";

/**
 * Handles the Relationships between Productions and Tags.
 */
@ApiTags("Production - Tag")
@Controller("production/:productionId/tag")
export class ProductionTagController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to GET /production/:productionId/tag
   * @param productionId ID in the URL of the request.
   * @returns The list of Tag objects for the Production
   */
  @ApiOperation({ summary: "Returns the Tags of the Production with id in the URL." })
  @ApiOkResponse({ type: TagDto, isArray: true, description: "Tags Found." })
  @Get()
  async getTagsOfProductionByID(
    @Param("productionId", ParseIntPipe) productionId: number
  ): Promise<TagDto[]> {
    return await this.productionService.getTagsById(productionId);
  }
  
  /**
   * Responds to PUT to "/production/:productionId/tag/:tagId".
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns The altered Production.
   */
  @ApiOperation({ summary: "Adds a Tag to a Production." })
  @ApiOkResponse({ type: ProductionDto, description: "Successfully added Tag to Production." })
  @Put(":tagId")
  async addTagToProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Param("tagId", ParseIntPipe) tagId: number,
  ): Promise<ProductionDto> {
    return await this.productionService.addTagToProduction(productionId, tagId);
  }

  /**
   * Responds to a DELETE to "/production/:productionId/tag/:tagId".
   * @param productionId The ID of the Production.
   * @param tagId The ID of the Tag.
   * @returns The altered Production.
   */
  @ApiOperation({ summary: "Removes a Tag from a Production." })
  @ApiOkResponse({ type: ProductionDto, description: "Successfully removed Tag from Production." })
  @Delete(":tagId")
  async removeTagFromProduction(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Param("tagId", ParseIntPipe) tagId: number,
  ): Promise<ProductionDto> {
    return await this.productionService.removeTagFromProduction(productionId, tagId);
  }
}
