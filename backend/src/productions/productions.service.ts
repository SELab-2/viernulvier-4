import { Injectable } from "@nestjs/common";
import { Production } from "@repo/common";
import { ProductionDatabaseService } from "src/database/db.production.service";

@Injectable()
export class ProductionsService {
  constructor(private readonly productionDBService: ProductionDatabaseService) {}

  /**
   * Responds to GET /productions
   * @returns All Production objects
   */
  async getAllProductions(): Promise<Production[]> {
    return await this.productionDBService.getProductions({});
  }

  /**
   * Responds to GET /productions/:id
   * @param id ID in the URL of the request.
   * @returns The Production object with corresponding ID
   */
  async getProductionById(id: number): Promise<Production> {
    return await this.productionDBService.getProductionById(id);
  }
}
