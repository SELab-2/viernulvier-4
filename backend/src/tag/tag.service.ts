import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { CreateTag, Tag, UpdateTag } from '@repo/common';
import { TagDatabaseService } from '../database/db.tag.service';

@Injectable()
export class TagService {
  constructor(private readonly dbTagService: TagDatabaseService) {}
  // creates a new tag in the database, returns the created tag.
  async create(createTag: CreateTag): Promise<Tag> {
    try {
      return await this.dbTagService.createTag(createTag);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create tag in database.');
    }
  }

  async findAll(): Promise<Tag[]> {
    try {
      return await this.dbTagService.getAllTags();
    } catch (error) {
      throw new NotFoundException('No tags found in database.');
    }
  }

  // retrieves all tags from the database, returns an array of tags.
  async findAllByProduction(productionId: number): Promise<Tag[]> {
    try {
      return await this.dbTagService.getTagsByProductionID(productionId);
    } catch (error) {
      throw new NotFoundException(`No tags found for production ${productionId}`);
    }
  }

  // retrieves a single tag by its ID, returns the tag if found, otherwise throws a NotFoundException.
  async findOne(id: number): Promise<Tag> {
    try {
      return await this.dbTagService.getTagById(id);
    } catch (error) {
      throw new NotFoundException(`Tag with ID ${id} not found.`);
    }
  }

  // updates a tag by its ID, returns the updated tag if successful, otherwise throws a NotFoundException if the tag does not exist.
  async update(id: number, updateTag: UpdateTag): Promise<Tag> {
    try {
      return await this.dbTagService.updateTag(id, updateTag);
    } catch (error) {
      throw new NotFoundException(`Tag with ID ${id} not found.`);
    }
  }

  // deletes a tag by its ID, returns a success message if deleted, otherwise throws a NotFoundException if the tag does not exist.
  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.dbTagService.getTagById(id); // Check if the tag exists before attempting to delete
      await this.dbTagService.deleteTag(id);
      return {
        message: `Tag with ID ${id} has been removed successfully.`
      };
    } catch (error) {
      throw new NotFoundException(`Tag with ID ${id} not found.`);
    }
  }
}