import {
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProductionService } from "../production.service";
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { MediaGalleryDto } from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";
import { type GalleryType, GalleryTypeEnum } from "@repo/common";

@ApiTags("Productions - Media")
@Controller("productions/:productionId/media")
export class ProductionMediaController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to a GET to "/productions/:productionId/media"
   * This endpoint only returns one singular Gallery
   * because in any case only one will be assigned to a Production.
   * @param productionId The ID of the production to get media for.
   * @param type is the wanted type of gallery.
   * @returns The media gallery associated to this production.
   */
  @ApiOperation({ summary: "Fetch media gallery connected to production." })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Gallery found." })
  @ApiQuery({
    name: "type",
    enum: GalleryTypeEnum.enum,
    description: "The type of media wanted.",
  })
  @Get()
  async getMedia(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Query("type", new ParseEnumPipe(GalleryTypeEnum)) type: GalleryType,
  ): Promise<MediaGalleryDto> {
    return await this.productionService.getProductionMedia(productionId, type);
  }

  /**
   * Responds to a PUT to "/productions/:productionId/media/:galleryId"
   * @param productionId The ID of the production
   * @param galleryId The ID of the gallery.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Link a media gallery to a production." })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Gallery linked." })
  @Put(":galleryId")
  async linkMedia(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Param("galleryId", ParseIntPipe) galleryId: number,
  ): Promise<void> {
    await this.productionService.linkMediaToProduction(productionId, galleryId);
  }

  /**
   * Responds to a DELETE to "/productions/:productionId/media/:galleryId"
   * @param productionId The ID of the production
   * @param galleryId The ID of the gallery.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Unlinks a media gallery from a production." })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Gallery unlinked." })
  @Delete(":galleryId")
  async unlinkMedia(
    @Param("productionId", ParseIntPipe) productionId: number,
    @Param("galleryId", ParseIntPipe) galleryId: number,
  ): Promise<void> {
    await this.productionService.unlinkMediaFromProduction(
      productionId,
      galleryId,
    );
  }
}
