import {
  Injectable,
  BadRequestException
} from '@nestjs/common';
import { TagDatabaseService } from '../database/db.tag.service';
import { CreateTagDto, TagDto, UpdateTagDto } from 'src/dto/dto';

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
  async findTagById(id: number): Promise<TagDto> {
    return await this.dbTagService.getTagById(id);
  }

  /**
   * Fetches all TagDto objects from the DBService.
   * @returns All TagDto objects
   */
  async findAllTags(): Promise<TagDto[]> {
    return await this.dbTagService.getTags();
  }

  /**
   * Modifies an exising TagDto with the data provided in the body.
   * @param id The ID of the tag.
   * @param updateTag The data we want to update.
   * @returns The newly updated TagDto.
   */
  async updateTag(id: number, updateTag: UpdateTagDto): Promise<TagDto> {
    if (updateTag.id && updateTag.id !== id) {
      throw new BadRequestException('ID in the body does not match ID in the path.');
    }
    // De DatabaseService handelt de merge en update af
    return await this.dbTagService.updateTag(updateTag);
  }

  /**
   * Deletes a TagDto from the database.
   * @param id The ID of the TagDto.
   * @returns A success message.
   */
  async deleteTag(id: number): Promise<{ message: string }> {
      await this.dbTagService.deleteTag(id);
      return {
        message: `Tag with ID ${id} has been removed successfully.`
      };
  }
}