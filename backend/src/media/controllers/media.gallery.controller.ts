import { Controller, Get, Query } from "@nestjs/common";
import { MediaGalleryService } from "../services/media.gallery.service";
import { PaginatedResponse, PaginationFilterSchema } from "@repo/common";
import { MediaGalleryDto, PaginationFilterDto } from "../../dto/dto";
import { ZodValidationPipe } from "nestjs-zod";
import { ApiOperation } from "@nestjs/swagger";
import { ApiOkPaginatedResponseAnyOf } from "../../common/decorators/api.ok";

/**
 * Defines all media gallery related endpoints.
 */
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
}
