import { Injectable } from "@nestjs/common";
import { Production } from "@repo/common";
import { ProductionDatabaseService } from "../database/db.production.service";

@Injectable()
export class ProductionService {
  constructor(private readonly productionDBService: ProductionDatabaseService) {}

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
}
