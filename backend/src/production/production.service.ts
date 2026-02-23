import { BadRequestException, Injectable } from "@nestjs/common";
import { Blog, CreateProduction, Production, UpdateProduction } from "@repo/common";
import { ProductionDatabaseService } from "../database/db.production.service";
import { BlogDatabaseService } from "src/database/db.blog.service";

@Injectable()
export class ProductionService {
  constructor(
    private readonly productionDBService: ProductionDatabaseService,
    private readonly blogDbService: BlogDatabaseService
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

    return await this.productionDBService.updateProduction(production);
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

    return await this.productionDBService.updateProduction(mergedProduction);
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
  async createProduction(newProduction: CreateProduction): Promise<Production> {
    return await this.productionDBService.createProduction(newProduction);
  }

  // -- Blogs -- //

  /**
   * Returns all Blog objects linked to a Production.
   * @param productionId The ID of the production. 
   * @returns A list of Blogs.
   */
  async getProductionBlogs(productionId: number): Promise<Blog[]> {
    return await this.productionDBService.getBlogsOfProduction(productionId);
  }

  /**
   * Links a Blog to a Production.
   * @param productionId The ID of the Production in question.
   * @param blogId The ID of the Blog in question.
   * @returns The Blog that was just linked to the Production.
   */
  async linkBlogToProduction(productionId: number, blogId: number): Promise<Blog> {
    await this.productionDBService.linkBlogWithProductionID(blogId, productionId);
    return await this.blogDbService.getBlogById(blogId);
  }

  /**
   * Unlinks a Blog from a Production.
   * @param productionId The ID of the Production in question.
   * @param blogId The ID of the Blog in question.
   * @returns The Production the Blog was unlinked from.
   */
  async unlinkBlogFromProduction(productionId: number, blogId: number): Promise<Production> {
    await this.productionDBService.deleteBlogFromProduction(productionId, blogId);
    return await this.productionDBService.getProductionById(productionId);
  } 
}
