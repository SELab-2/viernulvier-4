import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreateTagDto,
  PaginatedTagDto,
  TagDto,
  UpdateTagDto,
} from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";

@Injectable()
export class TagDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single tag by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The tag if there is one.
   */
  async getTagById(id: number): Promise<TagDto> {
    const query = `
      SELECT
        id,
        tag,
        created_at,
        updated_at,
        legacy_id
      FROM tags
      WHERE id = $1
    `;

    const result = await this.db.query<TagDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException("Tag not found");
    }
    return result[0];
  }

  /**
   * Get all tags.
   * @param amount is the amount of events per page (returned)
   * @param page is the page you want (indexed from 0)
   * @returns The tags if there are any.
   */
  async getTags(
    amount: number = 0,
    page: number = 0,
  ): Promise<PaginatedTagDto> {
    let query = `SELECT id, tag, created_at, updated_at, legacy_id FROM tags ORDER BY id`;

    const params: any[] = [];

    if (amount > 0) {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(amount, page * amount);
    }

    const [tags, countResult] = await Promise.all([
      this.db.query<TagDto>(query, params),
      this.db.query<{ count: string }>(`SELECT COUNT(*) as count FROM tags`),
    ]);

    return {
      page,
      limit: amount,
      totalItems: parseInt(countResult[0].count),
      objects: tags,
    };
  }

  /**
   * Create tag function, creates a tag in the database.
   * @param tag must be of the type "CreateTag" which has all fields defined besides the primary key id.
   * @returns the added tag if it was successful.
   */
  async createTag(tag: CreateTagDto): Promise<TagDto> {
    if (!tag.tag) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO tags (tag, legacy_id)
      VALUES ($1, $2)
      RETURNING
        id,
        tag,
        created_at,
        updated_at,
        legacy_id
      ;
    `;

    const values = [JSON.stringify(tag.tag)];

    const result = await this.db.query<TagDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create tag");
    }

    return result[0];
  }

  /**
   * Update function for tags. Updates the tag in the database.
   * @param tag must be of the type "UpdateTag", gives the freedom to define only what needs to be updated.
   * The id field in the tag MUST be defined.
   * @returns the updated tag if successful.
   */
  async updateTag(tagId: number, tag: UpdateTagDto): Promise<TagDto> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (tag.tag !== undefined) {
      fields.push(`tag = COALESCE(tag, '{}'::jsonb) || $${index++}::jsonb`);
      values.push(JSON.stringify(tag.tag));
    }

    if (fields.length === 0) {
      throw new BadRequestException("No fields provided to update");
    }

    values.push(tagId);

    const query = `
      UPDATE tags
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING
        id,
        tag,
        created_at,
        updated_at,
        legacy_id
      ;
    `;

    const result = await this.db.query<TagDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(`Tag with ID ${tagId} not found`);
    }

    return result[0];
  }

  /**
   * Delete function for deleting tags from the database.
   * @param id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteTag(id: number): Promise<void> {
    const query = `DELETE FROM tags WHERE id = $1 RETURNING id;`;

    const result = await this.db.query(query, [id]);
    if (result.length === 0) {
      throw new ResourceGoneException(
        `Cannot Delete: Tag with ID ${id} not found`,
      );
    }
  }

  // insert extra functions here if desired
}
