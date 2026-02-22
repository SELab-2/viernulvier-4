import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { DbService } from 'src/database/db.service';

@Injectable()
export class TagsService {
  constructor(private readonly dbService: DbService) {}

  async create(createTagDto: CreateTagDto) {
    try {
      const query = `
        INSERT INTO tags (tag, production_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const params = [createTagDto.tag, createTagDto.production_id];
      const result = await this.dbService.query(query, params);
      return result[0];
    } catch (error) {
      console.error('Fout bij het aanmaken van de tag:', error);
      throw new InternalServerErrorException('Failed to save tag to database.');
    }
  }

  async findAll() {
    try {
      const query = `SELECT * FROM tags;`;
      return await this.dbService.query(query);
    } catch (error) {
      console.error('Error retrieving all tags:', error);
      throw new InternalServerErrorException('Failed to retrieve tags from database.');
    }
  }

  async findOne(id: number) {
    try {
      const query = `SELECT * FROM tags WHERE id = $1;`;
      const result = await this.dbService.query(query, [id]);
      if (result.length === 0) {
        throw new NotFoundException(`Tag with ID ${id} not found.`);
      }
      return result[0];
    } catch (error) {
      console.error('Error retrieving tag with id:', id, error);
      throw new InternalServerErrorException('Failed to retrieve tag from database.');
    }
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    try {
      const query = `
        UPDATE tags
        SET tag = $1
        WHERE id = $2
        RETURNING *;
      `;
      const params = [updateTagDto.tag, id];
      const result = await this.dbService.query(query, params);
      if (result.length === 0) {
        throw new NotFoundException(`Tag with ID ${id} not found.`);
      }
      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error updating tag with id:', id, error);
      throw new InternalServerErrorException('Failed to update tag in database.');
    }
  }

  async remove(id: number) {
    try {
      const query = `DELETE FROM tags WHERE id = $1 RETURNING *;`;
      const result = await this.dbService.query(query, [id]);
      if (result.length === 0) {
        throw new NotFoundException(`Tag with ID ${id} not found.`);
      }
      return {
        message: `Tag with ID ${id} has been removed successfully.`,
        deletedRecord: result[0]
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error removing tag with id:', id, error);
      throw new InternalServerErrorException('Failed to remove tag from database.');
    }
  }
}