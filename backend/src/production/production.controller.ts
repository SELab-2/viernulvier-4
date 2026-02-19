import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ProductionService } from "./production.service";
import { Production } from "@repo/common";

@Controller("productions")
export class ProductionController {
  constructor(private readonly productionsService: ProductionService) {}

  /**
   * Responds to GET /productions
   * @returns All Production objects
   */
  @Get()
  async getAllProductions(): Promise<Production[]> {
    return await this.productionsService.getAllProductions();
  }

  /**
   * Responds to GET /productions/:id
   * @param id ID in the URL of the request.
   * @returns The Production object with corresponding ID
   */
  @Get(":id")
  async getById(@Param("id", ParseIntPipe) id: number): Promise<Production> {
    return await this.productionsService.getProductionById(id);
  }
}
