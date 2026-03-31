import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MediaGalleryService } from "../services/media.gallery.service";
import {
  CreateMediaGallerySchema,
  ModifyMediaGallerySchema,
  PaginatedResponse,
  PaginationFilterSchema,
  ReplaceMediaGallerySchema,
} from "@repo/common";
import {
  CreateMediaGalleryDto,
  MediaGalleryDto,
  MediaItemDto,
  ModifyMediaGalleryDto,
  PaginationFilterDto,
  ReplaceMediaGalleryDto,
} from "../../dto/dto";
import { ZodValidationPipe } from "nestjs-zod";
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, } from "@nestjs/swagger";
import { ApiOkPaginatedResponseAnyOf } from "../../common/decorators/api.ok";
import { ApiKeyGuard } from "../../auth/authGuard";

/**
 * Defines all media gallery related endpoints.
 */
@ApiTags("Media - Galleries")
@Controller("galleries")
export class MediaGalleryController {
  constructor(private readonly mediaGalleryService: MediaGalleryService) {}

  /**
   * Responds to a GET to "/media/galleries".
   * @param paginationFilter The pagination we want to use.
   * @returns The PaginatedResponse of galleries.
   */
  @ApiOperation({ summary: "Fetches a list of media galleries." })
  @ApiOkPaginatedResponseAnyOf(MediaGalleryDto)
  @Get()
  async getGalleries(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
  ): Promise<PaginatedResponse<MediaGalleryDto>> {
    return await this.mediaGalleryService.getGalleries(paginationFilter);
  }

  /**
   * Responds to a GET to "/media/galleries/:galleryId"
   * @param galleryId The ID of the gallery in the URL.
   * @returns The found gallery.
   */
  @ApiOperation({ summary: "Fetches one single media gallery." })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Found gallery." })
  @Get(":galleryId")
  async getGalleryById(
    @Param("galleryId", ParseIntPipe) galleryId: number,
  ): Promise<MediaGalleryDto> {
    return await this.mediaGalleryService.getGalleryById(galleryId);
  }

  /**
   * Responds to a POST to "/media/galleries"
   * @param createGallery The object we want to create.
   * @returns The newly created gallery object.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new media gallery." })
  @ApiBody({ type: CreateMediaGalleryDto })
  @ApiCreatedResponse({
    type: MediaGalleryDto,
    description: "Created gallery.",
  })
  @Post()
  async createGallery(
    @Body(new ZodValidationPipe(CreateMediaGallerySchema))
    createGallery: CreateMediaGalleryDto,
  ): Promise<MediaGalleryDto> {
    return await this.mediaGalleryService.createGallery(createGallery);
  }

  /**
   * Responds to a PUT to "/media/galleries/:galleryId"
   * @param galleryId The ID of the gallery.
   * @param replaceGallery The gallery we want to replace with.
   * @returns The replaced gallery.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces an existing media gallery." })
  @ApiBody({ type: ReplaceMediaGalleryDto })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Replaced gallery." })
  @Put(":galleryId")
  async replaceGallery(
    @Param("galleryId", ParseIntPipe) galleryId: number,
    @Body(new ZodValidationPipe(ReplaceMediaGallerySchema))
    replaceGallery: ReplaceMediaGalleryDto,
  ): Promise<MediaGalleryDto> {
    return await this.mediaGalleryService.updateGallery(
      galleryId,
      replaceGallery,
    );
  }

  /**
   * Responds to a PATCH to "/media/galleries/:galleryId"
   * @param galleryId The ID of the gallery.
   * @param modifyGallery The partial data to modify with.
   * @returns The modified media gallery.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing media gallery." })
  @ApiBody({ type: ModifyMediaGalleryDto })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Modified gallery." })
  @Patch(":galleryId")
  async modifyGallery(
    @Param("galleryId", ParseIntPipe) galleryId: number,
    @Body(new ZodValidationPipe(ModifyMediaGallerySchema))
    modifyGallery: ModifyMediaGalleryDto,
  ): Promise<MediaGalleryDto> {
    return await this.mediaGalleryService.updateGallery(
      galleryId,
      modifyGallery,
    );
  }

  /**
   * Responds to a DELETE to "/media/galleries/:galleryId"
   * @param galleryId The ID of the gallery we want to delete.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an existing gallery." })
  @ApiOkResponse({
    description: "Deleted the existing gallery.",
  })
  @Delete(":galleryId")
  async deleteGallery(
    @Param("galleryId", ParseIntPipe) galleryId: number,
  ): Promise<void> {
    await this.mediaGalleryService.deleteGallery(galleryId);
  }

  /**
   * Gallery -- Item
   */

  /**
   * Responds to a GET to "/media/galleries/:galleryId/items"
   * @param galleryId The ID of the gallery in the URL.
   * @returns A list of items for that gallery.
   */
  @ApiOperation({ summary: "Gets the items from one gallery." })
  @ApiOkResponse({
    type: MediaItemDto,
    isArray: true,
    description: "Fetched items from gallery",
  })
  @Get(":galleryId/items")
  async getGalleryItems(
    @Param("galleryId", ParseIntPipe) galleryId: number,
  ): Promise<MediaItemDto[]> {
    return await this.mediaGalleryService.getGalleryItems(galleryId);
  }

  /**
   * Responds to a PUT to "/media/galleries/:galleryId/items/:itemId"
   * @param galleryId The ID of the gallery.
   * @param itemId The ID of the item.
   * @returns T/F Whether the link was made or not.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Links a media item to a media gallery." })
  @ApiOkResponse({ description: "Item linked." })
  @Put(":galleryId/items/:itemId")
  async linkItemToGallery(
    @Param("galleryId", ParseIntPipe) galleryId: number,
    @Param("itemId", ParseIntPipe) itemId: number,
  ): Promise<void> {
    await this.mediaGalleryService.linkItemToGallery(galleryId, itemId);
  }

  /**
   * Responds to a DELETE to "/media/galleries/:galleryId/items/:itemId"
   * @param galleryId The ID of the gallery.
   * @param itemId The ID of the item.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Unlinks a media item from a media gallery." })
  @ApiOkResponse({ description: "Item unlinked." })
  @Delete(":galleryId/items/:itemId")
  async unlinkItemFromGallery(
    @Param("galleryId", ParseIntPipe) galleryId: number,
    @Param("itemId", ParseIntPipe) itemId: number,
  ): Promise<void> {
    await this.mediaGalleryService.unlinkItemFromGallery(galleryId, itemId);
  }
}
