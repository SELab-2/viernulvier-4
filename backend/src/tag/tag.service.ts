import { Injectable } from "@nestjs/common";
import { TagDatabaseService } from "../database/db.tag.service";
import {
  CreateTagDto,
  PaginationFilterDto,
  TagDto,
  ModifyTagDto,
  FilterTagDto,
} from "../dto/dto";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class TagService {
  constructor(private readonly dbTagService: TagDatabaseService) {}

  /**
   * Creates a TagDto and adds it to the database
   * @param createTag The new TagDto data we want to add
   * @returns The newly created TagDto.
   */
  async createTag(createTag: CreateTagDto): Promise<TagDto> {
    return await this.dbTagService.createTag(createTag);
  }

  /**
   * Fetches TagDto object from the DBService with given ID.
   * @param id ID in the URL of the request.
   * @returns The TagDto object with corresponding ID
   */
  async getTagById(id: number): Promise<TagDto> {
    return await this.dbTagService.getTagById(id);
  }

  /**
   * Fetches all TagDto objects from the DBService.
   * @param paginationFilter is the pagination params
   * @returns All TagDto objects
   */
  async getAllTags(
    paginationFilter: PaginationFilterDto,
    tagFilters: FilterTagDto,
  ): Promise<PaginatedResponse<TagDto>> {
    return await this.dbTagService.getTags(paginationFilter, tagFilters);
  }

  /**
   * Modifies an existing TagDto with the data provided in the body.
   * @param id The ID of the tag.
   * @param modifyTag The data we want to update.
   * @returns The newly updated TagDto.
   */
  async modifyTag(id: number, modifyTag: ModifyTagDto): Promise<TagDto> {
    return await this.dbTagService.updateTag(id, modifyTag);
  }

  /**
   * Deletes a TagDto from the database.
   * @param id The ID of the TagDto.
   * @returns A success message.
   */
  async deleteTag(id: number): Promise<{ message: string }> {
    await this.dbTagService.deleteTag(id);
    return {
      message: `Tag with ID ${id} has been removed successfully.`,
    };
  }
}
