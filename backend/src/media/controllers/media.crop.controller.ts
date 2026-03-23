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
import { MediaCropService } from "../services/media.crop.service";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateMediaCropSchema,
  MediaCropSchema,
  PaginatedResponse,
  PaginationFilterSchema,
  UpdatedMediaCropSchema,
} from "@repo/common";
import {
  CreateMediaCropDto,
  MediaCropDto,
  PaginationFilterDto,
  UpdateMediaCropDto,
} from "../../dto/dto";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiOkPaginatedResponseAnyOf } from "../../common/decorators/api.ok";
import { ApiKeyGuard } from "../../auth/authGuard";

/**
 * Defines all media crop related endpoints
 */
@Controller("crops")
export class MediaCropController {
  constructor(private readonly mediaCropService: MediaCropService) {}

  /**
   * Responds to a GET to "media/crops"
   * @param paginationFilters The Filters for pagination and ordering.
   * @returns A paginated list of media crops.
   */
  @ApiOperation({ summary: "Fetch a paginated list of crops." })
  @ApiOkPaginatedResponseAnyOf(MediaCropDto)
  @Get()
  async getCrops(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<MediaCropDto>> {
    return await this.mediaCropService.getCrops(paginationFilters);
  }

  /**
   * Responds to a GET to "media/crops/:cropId"
   * @param cropId The ID of the crop we want to fetch.
   * @returns The crop.
   */
  @ApiOperation({ summary: "Fetch one media crop." })
  @ApiOkResponse({ type: MediaCropDto, description: "Found media crop." })
  @Get(":cropId")
  async getCropById(
    @Param("cropId", ParseIntPipe) cropId: number,
  ): Promise<MediaCropDto> {
    return await this.mediaCropService.getCropById(cropId);
  }

  /**
   * Responds to a POST to "/media/crops"
   * @param createCrop The crop we want to create (includes the item it should be linked to)
   * @returns The created crop.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Create a new media crop." })
  @ApiCreatedResponse({
    type: MediaCropDto,
    description: "Created media crop.",
  })
  @Post()
  async createCrop(
    @Body(new ZodValidationPipe(CreateMediaCropSchema))
    createCrop: CreateMediaCropDto,
  ): Promise<MediaCropDto> {
    return await this.mediaCropService.createCrop(createCrop);
  }

  /**
   * Responds to a PUT to "/media/crops/:cropId"
   * @param cropId The ID of the crop.
   * @param replaceCrop The crop we want to replace with.
   * @returns The replaced crop.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces an existing media crop." })
  @ApiBody({ type: MediaCropDto })
  @ApiOkResponse({ type: MediaCropDto, description: "Replaced crop." })
  @Put(":cropId")
  async replaceCrop(
    @Param("cropId", ParseIntPipe) cropId: number,
    @Body(new ZodValidationPipe(MediaCropSchema)) replaceCrop: MediaCropDto,
  ): Promise<MediaCropDto> {
    return await this.mediaCropService.replaceCrop(cropId, replaceCrop);
  }

  /**
   * Responds to a PATCH to "/media/crops/:cropId"
   * @param cropId The ID of the crop.
   * @param modifyCrop The partial data to modify with.
   * @returns The modified media crop.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing media crop." })
  @ApiBody({ type: UpdateMediaCropDto })
  @ApiOkResponse({ type: MediaCropDto, description: "Modified crop." })
  @Patch(":cropId")
  async modifyCrop(
    @Param("cropId", ParseIntPipe) cropId: number,
    @Body(new ZodValidationPipe(UpdatedMediaCropSchema))
    modifyCrop: UpdateMediaCropDto,
  ): Promise<MediaCropDto> {
    return await this.mediaCropService.modifyCrop(cropId, modifyCrop);
  }

  /**
   * Responds to a DELETE to "/media/crops/:cropId"
   * @param cropId The ID of the crop.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an existing media crop." })
  @ApiOkResponse({ description: "Deleted crop." })
  @Delete(":cropId")
  async deleteCrop(
    @Param("cropId", ParseIntPipe) cropId: number,
  ): Promise<void> {
    await this.mediaCropService.deleteCrop(cropId);
  }
}
