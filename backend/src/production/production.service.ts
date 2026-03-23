import { BadRequestException, Injectable } from "@nestjs/common";
import {
  BlogDto,
  CreateProductionDto,
  FilterProductionDto,
  PaginationFilterDto,
  ProductionDto,
  TagDto,
  UpdateProductionDto,
} from "../dto/dto";
import { ProductionDatabaseService } from "../database/db.production.service";
import { BlogDatabaseService } from "../database/db.blog.service";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class ProductionService {
  constructor(
    private readonly productionDBService: ProductionDatabaseService,
    private readonly blogDbService: BlogDatabaseService,
  ) {}

  /**
   * Fetches all ProductionDto objects from the DBService
   * note: pagination is done here via the filters param.
   * @param productionFilters The filters to be applied to the query.
   * @param paginationFilters Filters to do with pagination and ordering.
   * @returns All ProductionDto objects
   */
  async getAllProductions(
    productionFilters: FilterProductionDto,
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<ProductionDto>> {
    return await this.productionDBService.getProductions(
      productionFilters,
      paginationFilters,
    );
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

    // * NOTE: Using Upsert here will make sure that
    // * if the production does not yet exist it is created instead.
    return await this.productionDBService.upsertProduction(production);
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

    return await this.productionDBService.updateProduction(
      id,
      mergedProduction,
    );
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

  // -- Blogs -- //

  /**
   * Returns all Blog objects linked to a Production.
   * @param productionId The ID of the production.
   * @returns A list of Blogs.
   */
  async getProductionBlogs(productionId: number): Promise<BlogDto[]> {
    return await this.productionDBService.getBlogsOfProduction(productionId);
  }

  /**
   * Links a Blog to a Production.
   * @param productionId The ID of the Production in question.
   * @param blogId The ID of the Blog in question.
   * @returns The Blog that was just linked to the Production.
   */
  async linkBlogToProduction(
    productionId: number,
    blogId: number,
  ): Promise<BlogDto> {
    await this.productionDBService.linkBlogWithProductionID(
      blogId,
      productionId,
    );
    return await this.blogDbService.getBlogById(blogId);
  }

  /**
   * Unlinks a Blog from a Production.
   * @param productionId The ID of the Production in question.
   * @param blogId The ID of the Blog in question.
   * @returns The Production the Blog was unlinked from.
   */
  async unlinkBlogFromProduction(
    productionId: number,
    blogId: number,
  ): Promise<ProductionDto> {
    await this.productionDBService.deleteBlogFromProduction(
      productionId,
      blogId,
    );
    return await this.productionDBService.getProductionById(productionId);
  }

  // -- Tags -- //

  /**
   * Fetches all TagDto objects for a given production id.
   * @param id ID in the URL of the request.
   * @returns The list of TagDto objects for the Production
   */
  async getTagsById(id: number): Promise<TagDto[]> {
    const production: ProductionDto =
      await this.productionDBService.getProductionById(id);
    return await this.productionDBService.getTagsOfProduction(production);
  }

  /**
   * Adds a specific Tag to a Production.
   * @param productionId The ID of the Production we want to link the Tag to.
   * @param tagId The ID of the Tag we want to link.
   * @returns The Production in question.
   */
  async addTagToProduction(
    productionId: number,
    tagId: number,
  ): Promise<ProductionDto> {
    await this.productionDBService.addTagToProduction(tagId, productionId);
    return await this.productionDBService.getProductionById(productionId);
  }

  /**
   * Removes a specific Tag from a Production. If the Tag wasn't linked to the
   * Production nothing happens.
   * @param productionId The ID of the Production we want to remove the Tag from.
   * @param tagId The ID of the Tag we want to remove.
   * @returns The Production in question.
   */
  async removeTagFromProduction(
    productionId: number,
    tagId: number,
  ): Promise<ProductionDto> {
    await this.productionDBService.removeTagFromProduction(tagId, productionId);
    return await this.productionDBService.getProductionById(productionId);
  }
}
