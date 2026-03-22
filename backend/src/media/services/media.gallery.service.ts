import { Injectable } from "@nestjs/common";
import { MediaDatabaseService } from "../../database/db.media.service";
import { PaginatedResponse, PaginationFilter } from "@repo/common";
import { MediaGalleryDto } from "src/dto/dto";

/**
 * Defines the connections between controller and database for
 * media gallery related actions.
 */
@Injectable()
export class MediaGalleryService {
  constructor(private readonly mediaDbService: MediaDatabaseService) {}

  /**
   * Fetches a page of all galleries from the database service.
   * @param paginationFilter The filters for what page and amount to fetch.
   * @returns The PaginatedResponse containing the galleries.
   */
  async getGalleries(
    paginationFilter: PaginationFilter,
  ): Promise<PaginatedResponse<MediaGalleryDto>> {
    return await this.mediaDbService.getGalleries(
      paginationFilter.limit,
      paginationFilter.page,
    );
  }
}
