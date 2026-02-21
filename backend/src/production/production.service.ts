import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateProduction, Production, UpdateProduction } from "@repo/common";
import { ProductionDatabaseService } from "src/database/db.production.service";

@Injectable()
export class ProductionService {
  constructor(
    private readonly productionDBService: ProductionDatabaseService,
  ) {}

  /**
   * Fetches all Production objects from the DBService
   * @returns All Production objects
   */
  async getAllProductions(): Promise<Production[]> {
    return await this.productionDBService.getProductions({});
  }

  /**
   * Fetches Production object from the DBService with given ID.
   * @param id ID in the URL of the request.
   * @returns The Production object with corresponding ID
   */
  async getProductionById(id: number): Promise<Production> {
    return await this.productionDBService.getProductionById(id);
  }

  /**
   * Replaces a Production in the database and returns the updated one.
   * @param id The ID of the production.
   * @param production The Production Object itself.
   * @returns The newly updated Production.
   */
  async replaceProduction(
    id: number,
    production: Production,
  ): Promise<Production> {
    if (id !== production.id)
      throw new BadRequestException("ID in the URL must match ID in the body.");

    const updatedProduction: Production =
      await this.productionDBService.updateProduction(id, production);

    return updatedProduction;
  }

  /**
   * Modifies an existing Production with the data provided in the body.
   * @param id The ID of the production.
   * @param patchData The data we want to update.
   * @returns The newly updated Production.
   */
  async modifyProduction(
    id: number,
    patchData: UpdateProduction,
  ): Promise<Production> {
    const existingProduction: Production =
      await this.productionDBService.getProductionById(id);

    const mergedProduction: Production = {
      ...existingProduction,
      ...patchData,
      id,
    };

    const updatedProduction: Production =
      await this.productionDBService.updateProduction(id, mergedProduction);

    return updatedProduction;
  }

  /**
   * Deletes a Production from the database.
   * @param id The ID of the Production.
   * @returns Nothing.
   */
  async deleteProduction(id: number): Promise<void> {
    await this.productionDBService.deleteProduction(id);
    return;
  }

  /**
   * Creates a Production and adds it to the database
   * @param newProduction The new Production data we want to add
   * @returns The newly created Production.
   */
  async createProduction(newProduction: CreateProduction) : Promise<Production> {
    return await this.productionDBService.createProduction(newProduction)
  }
}
