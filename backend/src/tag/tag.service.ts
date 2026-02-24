import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { CreateTag, Tag, UpdateTag } from '@repo/common';
import { TagDatabaseService } from '../database/db.tag.service';

@Injectable()
export class TagService {
  constructor(private readonly dbTagService: TagDatabaseService) {}
  // creates a new tag in the database, returns the created tag.
  async createTag(createTag: CreateTag): Promise<Tag> {
    return await this.dbTagService.createTag(createTag);
  }

  // retrieves a single tag by its ID, returns the tag if found, otherwise throws a NotFoundException.
  async findOneTag(id: number): Promise<Tag> {
    return await this.dbTagService.getTagById(id);
  }

  // updates a tag by its ID, returns the updated tag if successful, otherwise throws a NotFoundException if the tag does not exist.
  async updateTag(id: number, updateTag: UpdateTag): Promise<Tag> {
    if (updateTag.id && updateTag.id !== id) {
      throw new BadRequestException('ID in the body does not match ID in the path.');
    }
    return await this.dbTagService.updateTag(updateTag);
  }

  // deletes a tag by its ID, returns a success message if deleted, otherwise throws a NotFoundException if the tag does not exist.
  async deleteTag(id: number): Promise<{ message: string }> {
      await this.dbTagService.deleteTag(id);
      return {
        message: `Tag with ID ${id} has been removed successfully.`
      };
  }
}