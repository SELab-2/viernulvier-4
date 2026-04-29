import { Injectable } from "@nestjs/common";
import { SeriesDatabaseService } from "../database/db.series.service";
import {
  CreateSeriesDto,
  ModifySeriesDto,
  PaginationFilterDto,
  ProductionDto,
  ReplaceSeriesDto,
  SeriesDto,
} from "../dto/dto";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class SeriesService {
  constructor(private readonly seriesDbService: SeriesDatabaseService) {}

  /**
   * Fetches a series by it's id from the database.
   * @param seriesId The ID of the series to fetch.
   * @returns The fetched series.
   */
  async getSeriesById(seriesId: number): Promise<SeriesDto> {
    return await this.seriesDbService.getSeriesById(seriesId);
  }

  /**
   * Fetches a paginated list of series.
   * @param paginationFilters The filters to paginate by.
   * @returns Paginated list of series.
   */
  async getSeries(
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<SeriesDto>> {
    return await this.seriesDbService.getSeries(paginationFilters);
  }

  /**
   * Creates a new series using the db service.
   * @param createSeries The object to use when creating.
   * @returns The newly created Series.
   */
  async createSeries(createSeries: CreateSeriesDto): Promise<SeriesDto> {
    return await this.seriesDbService.createSeries(createSeries);
  }

  /**
   * Updates a series with either a full replace or a modify.
   * @param seriesId The ID of the series to modify.
   * @param updateSeries The object to update with.
   * @returns The newly updated series.
   */
  async updateSeries(
    seriesId: number,
    updateSeries: ReplaceSeriesDto | ModifySeriesDto,
  ): Promise<SeriesDto> {
    return await this.seriesDbService.updateSeries(seriesId, updateSeries);
  }

  /**
   * Deletes an entire series from the database.
   * @param seriesId The ID of the series to delete.
   */
  async deleteSeries(seriesId: number): Promise<void> {
    await this.seriesDbService.deleteSeries(seriesId);
  }

  /**
   * Adding Productions.
   */

  /**
   * Return all productions tied to a single series paginated.
   * @param seriesId The ID of the series.
   * @param paginationFilter The filters applied to pagination.
   * @returns The paginated list of productions.
   */
  async getSeriesProductions(
    seriesId: number,
    paginationFilter: PaginationFilterDto,
  ): Promise<PaginatedResponse<ProductionDto>> {
    return await this.seriesDbService.getProductionsFromSeries(
      seriesId,
      paginationFilter,
    );
  }

  /**
   * Links a list of productions to a single series.
   * @param seriesId The ID of the series.
   * @param productionIds The IDs of the productions.
   */
  async linkProductionsToSeries(seriesId: number, productionIds: number[]) {
    await this.seriesDbService.linkProductionsToSeries(productionIds, seriesId);
  }

  /**
   * Unlinks a single production from a series.
   * @param seriesId The ID of the series to unlink from.
   * @param productionId The ID of the production to unlink.
   */
  async unlinkProductionFromSeries(seriesId: number, productionId: number) {
    await this.seriesDbService.unlinkProductionFromSeries(
      productionId,
      seriesId,
    );
  }
}
