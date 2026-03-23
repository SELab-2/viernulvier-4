import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ProductionService } from "../production.service";
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { MediaGalleryDto } from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";

@ApiTags("Productions - Media")
@Controller("productions/:productionId/media")
export class ProductionMediaController {
  constructor(private readonly productionService: ProductionService) {}

  /**
   * Responds to a GET to "/productions/:productionId/media"
   * @param productionId The ID of the production to get media for.
   * @returns The media gallery associated to this production.
   */
  @ApiOperation({ summary: "Fetch media gallery connected to production." })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Gallery found." })
  @Get()
  async getMedia(
    @Param("productionId", ParseIntPipe) productionId: number,
  ): Promise<MediaGalleryDto> {
    return await this.productionService.getProductionMedia(productionId);
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
