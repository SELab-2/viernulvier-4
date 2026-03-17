import { Injectable } from "@nestjs/common";
import { PriceDatabaseService } from "../database/db.price.service";
import {
  CreatePriceDto,
  PaginatedPriceDto,
  PaginationFilterDto,
  PriceDto,
  UpdatePriceDto,
} from "../dto/dto";

@Injectable()
export class PriceService {
  constructor(private readonly priceDbService: PriceDatabaseService) {}

  /**
   * Fetch a Price object by its ID.
   * @param priceId The ID of the Price we want to fetch.
   * @returns A Price object.
   */
  async getPriceById(priceId: number): Promise<PriceDto> {
    return await this.priceDbService.getPriceById(priceId);
  }

  /**
   * Fetches all Price objects from the database.
   * @returns All Prices.
   */
  async getPrices(
    paginationFilter: PaginationFilterDto,
  ): Promise<PaginatedPriceDto> {
    return await this.priceDbService.getPrices(
      paginationFilter.limit,
      paginationFilter.page,
    );
  }

  /**
   * Creates a new Price in the database.
   * @param createPrice The needed values to create a new Price object.
   * @returns The newly created Price object.
   */
  async createPrice(createPrice: CreatePriceDto): Promise<PriceDto> {
    return await this.priceDbService.createPrice(createPrice);
  }

  /**
   * Updates an existing Price in the database.
   * @param priceId The ID of the price.
   * @param updatePrice The needed values to update the Price.
   * @returns The newly updated Price object.
   */
  async updatePrice(
    priceId: number,
    updatePrice: UpdatePriceDto,
  ): Promise<PriceDto> {
    return await this.priceDbService.updatePrice(priceId, updatePrice);
  }

  /**
   * Deletes an existing Price object from the database.
   * @param priceId The ID of the Price we want to delete.
   */
  async deletePrice(priceId: number): Promise<void> {
    await this.priceDbService.deletePrice(priceId);
  }
}
