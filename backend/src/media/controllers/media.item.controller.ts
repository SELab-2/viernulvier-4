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
import { MediaItemService } from "../services/media.item.service";
import {
  CreateMediaItemSchema,
  LanguageQuerySchema,
  MediaItemSchema,
  PaginatedResponse,
  PaginationFilterSchema,
  UpdatedMediaItemSchema,
} from "@repo/common";
import {
  CreateMediaItemDto,
  LanguageQueryDto,
  MediaCropDto,
  MediaItemDto,
  MediaItemViewDto,
  PaginationFilterDto,
  UpdateMediaItemDto,
} from "../../dto/dto";
import { LanguageService } from "../../util/language/language.service";
import { ZodValidationPipe } from "nestjs-zod";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import {
  ApiOkAnyOf,
  ApiOkPaginatedResponseAnyOf,
} from "../../common/decorators/api.ok";
import { ApiKeyGuard } from "../../auth/authGuard";

/**
 * Defines all media item related endpoints.
 */
@ApiTags("Media - Items")
@Controller("items")
export class MediaItemController {
  constructor(
    private readonly mediaItemService: MediaItemService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to a GET to "/media/items".
   * @param paginationFilter The Filters for pagination and ordering.
   * @param lang The Language Query.
   * @returns A paginated list of media items.
   */
  @ApiOperation({ summary: "Fetch a paginated list of items." })
  @ApiOkPaginatedResponseAnyOf(MediaItemDto, MediaItemViewDto)
  @Get()
  async getItems(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<PaginatedResponse<MediaItemDto | MediaItemViewDto>> {
    return this.ls.flattenByLanguage(
      await this.mediaItemService.getItems(paginationFilter),
      lang.lang,
    );
  }

  /**
   * Responds to a GET to "/media/items/:itemId"
   * @param itemId The ID of the item we want to fetch.
   * @param lang The language query we want to apply to it.
   * @returns The found media item.
   */
  @ApiOperation({ summary: "Fetch one single media item." })
  @ApiOkAnyOf(MediaItemDto, MediaItemViewDto)
  @Get(":itemId")
  async getItemById(
    @Param("itemId", ParseIntPipe) itemId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<MediaItemDto | MediaItemViewDto> {
    return this.ls.flattenByLanguage(
      await this.mediaItemService.getItemById(itemId),
      lang.lang,
    );
  }

  /**
   * Responds to a POST to "/media/items"
   * @param createItem The item we want to create.
   * @returns The newly created item.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Create a new media item." })
  @ApiBody({ type: CreateMediaItemDto })
  @ApiCreatedResponse({
    description: "Created item successfully.",
    type: MediaItemDto,
  })
  @Post()
  async createItem(
    @Body(new ZodValidationPipe(CreateMediaItemSchema))
    createItem: CreateMediaItemDto,
  ): Promise<MediaItemDto> {
    return await this.mediaItemService.createItem(createItem);
  }

  /**
   * Responds to a PUT to "/media/items/:itemId"
   * @param itemId The ID of the item we want to replace.
   * @param replaceItem The Item we want to replace it with.
   * @returns The newly placed item.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replace an existing media item." })
  @ApiBody({ type: MediaItemDto })
  @ApiOkResponse({ type: MediaItemDto, description: "Item replaced." })
  @Put(":itemId")
  async replaceItem(
    @Param("itemId", ParseIntPipe) itemId: number,
    @Body(new ZodValidationPipe(MediaItemSchema)) replaceItem: MediaItemDto,
  ): Promise<MediaItemDto> {
    return await this.mediaItemService.replaceItem(itemId, replaceItem);
  }

  /**
   * Responds to a PATCH to "/media/items/:itemId"
   * @param itemId The ID of the item we want to modify
   * @param modifyItem The Item we want to apply the changes from.
   * @returns The newly modified item.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing media item." })
  @ApiBody({ type: UpdateMediaItemDto })
  @ApiOkResponse({ type: MediaItemDto, description: "Item modified." })
  @Patch(":itemId")
  async modifyItem(
    @Param("itemId", ParseIntPipe) itemId: number,
    @Body(new ZodValidationPipe(UpdatedMediaItemSchema))
    modifyItem: UpdateMediaItemDto,
  ): Promise<MediaItemDto> {
    return await this.mediaItemService.modifyItem(itemId, modifyItem);
  }

  /**
   * Responds to a DELETE to "/media/items/:itemId"
   * @param itemId The ID of the item we want to delete.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Delete an existing media item." })
  @ApiOkResponse({ description: "Deleted media item." })
  @Delete(":itemId")
  async deleteItem(
    @Param("itemId", ParseIntPipe) itemId: number,
  ): Promise<void> {
    await this.mediaItemService.deleteItem(itemId);
  }

  /**
   * Item -- Crop
   */

  /**
   * Responds to a GET to "/media/items/:itemId/crops"
   * @param itemId The ID of the item we want crops for.
   * @returns The Crops of that item.
   */
  @ApiOperation({ summary: "Get all crops for an item." })
  @ApiOkResponse({
    type: MediaCropDto,
    isArray: true,
    description: "Fetched all crops for this item.",
  })
  @Get(":itemId/crops")
  async getItemCrops(
    @Param("itemId", ParseIntPipe) itemId: number,
  ): Promise<MediaCropDto[]> {
    return await this.mediaItemService.getItemCrops(itemId);
  }

  /**
   * Responds to a PUT to "/media/items/:itemId/crops/:cropId"
   * @param itemId The ID of the item.
   * @param cropId The ID of the crop.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Links a crop to an item." })
  @ApiOkResponse({ description: "Crop linked to item." })
  @Put(":itemId/crops/:cropId")
  async linkCropToItem(
    @Param("itemId", ParseIntPipe) itemId: number,
    @Param("cropId", ParseIntPipe) cropId: number,
  ): Promise<void> {
    await this.mediaItemService.linkCropToItem(itemId, cropId);
  }

  /**
   * Responds to a DELETE to "/media/items/:itemId/crops/:cropId"
   * @param itemId The ID of the item.
   * @param cropId The ID of the crop.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Unlinks a crop from an item." })
  @ApiOkResponse({ description: "Crop unlinked from item." })
  @Delete(":itemId/crops/:cropId")
  async unlinkCropFromItem(
    @Param("itemId", ParseIntPipe) itemId: number,
    @Param("cropId", ParseIntPipe) cropId: number,
  ): Promise<void> {
    await this.mediaItemService.unlinkCropFromItem(itemId, cropId);
  }
}
