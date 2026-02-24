import { BadRequestException, Injectable } from "@nestjs/common";
import {
  CreateProductionDto,
  ProductionDto,
  TagDto,
  UpdateProductionDto,
} from "../dto/dto";
import { ProductionDatabaseService } from "../database/db.production.service";

@Injectable()
export class ProductionService {
  constructor(
    private readonly productionDBService: ProductionDatabaseService,
  ) {}

  /**
   * Fetches all ProductionDto objects from the DBService
   * @returns All ProductionDto objects
   */
  async getAllProductions(): Promise<ProductionDto[]> {
    return await this.productionDBService.getProductions({});
  }

  /**
   * Fetches ProductionDto object from the DBService with given ID.
   * @param id ID in the URL of the request.
   * @returns The ProductionDto object with corresponding ID
   */
  async getProductionById(id: number): Promise<ProductionDto> {
    return await this.productionDBService.getProductionById(id);
  }

  /**
   * Fetches all TagDto objects for a given production id.
   * @param id ID in the URL of the request.
   * @returns The list of TagDto objects for the Production
   */
  async getTagsById(id: number): Promise<TagDto[]> {
    const production: ProductionDto = await this.productionDBService.getProductionById(id);
    return await this.productionDBService.getTagsOfProduction(production);
  }

  /**
   * Replaces a ProductionDto in the database and returns the updated one.
   * @param id The ID of the production.
   * @param production The ProductionDto Object itself.
   * @returns The newly updated ProductionDto.
   */
  async replaceProduction(
    id: number,
    production: ProductionDto,
  ): Promise<ProductionDto> {
    if (id !== production.id)
      throw new BadRequestException("ID in the URL must match ID in the body.");

    return await this.productionDBService.updateProduction(production);
  }

  /**
   * Modifies an existing ProductionDto with the data provided in the body.
   * @param id The ID of the production.
   * @param patchData The data we want to update.
   * @returns The newly updated ProductionDto.
   */
  async modifyProduction(
    id: number,
    patchData: UpdateProductionDto,
  ): Promise<ProductionDto> {
    const existingProduction: ProductionDto =
      await this.productionDBService.getProductionById(id);

    const mergedProduction: ProductionDto = {
      ...existingProduction,
      ...patchData,
      id,
    };

    return await this.productionDBService.updateProduction(mergedProduction);
  }

  /**
   * Deletes a ProductionDto from the database.
   * @param id The ID of the ProductionDto.
   * @returns Nothing.
   */
  async deleteProduction(id: number): Promise<void> {
    await this.productionDBService.deleteProduction(id);
    return;
  }

  /**
   * Creates a ProductionDto and adds it to the database
   * @param newProduction The new ProductionDto data we want to add
   * @returns The newly created ProductionDto.
   */
  async createProduction(
    newProduction: CreateProductionDto,
  ): Promise<ProductionDto> {
    return await this.productionDBService.createProduction(newProduction);
  }
}
