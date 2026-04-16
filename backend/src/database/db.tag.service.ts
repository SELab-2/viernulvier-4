import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  CreateTagDto,
  TagDto,
  ModifyTagDto,
  PaginationFilterDto,
} from "../dto/dto";
import { PaginatedResponse, TagSchema } from "@repo/common";
import {
  generateCountQuery,
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";
import { ResourceNotFoundException } from "../common/exceptions";

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
    const returningClause = generateReturningClause(TagSchema);

    const query = `
      SELECT ${returningClause}
      FROM tags
      WHERE id = $1;
    `;

    const result = await this.db.query<TagDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceNotFoundException(TagDto, id);
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
    paginationFilters: PaginationFilterDto,
  ): Promise<PaginatedResponse<TagDto>> {
    const returningClause = generateReturningClause(TagSchema);

    const query = `
      SELECT ${returningClause}
      FROM tags 
      ORDER BY id
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = generateCountQuery("tags");

    const offset = paginationFilters.page * paginationFilters.limit;

    const [tags, countResult] = await Promise.all([
      this.db.query<TagDto>(query, [paginationFilters.limit, offset]),
      this.db.query<{ count: string }>(countQuery),
    ]);

    return {
      page: paginationFilters.page,
      limit: paginationFilters.limit,
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
    const { columns, placeholders, values } = generateInsertClause(tag);
    const returningClause = generateReturningClause(TagSchema);

    const query = `
      INSERT INTO tags (${columns})
      VALUES (${placeholders})
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<TagDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create tag.");
    }

    return result[0];
  }

  /**
   * Update function for tags. Updates the tag in the database.
   * @param tag must be of the type "ModifyTag", gives the freedom to define only what needs to be updated.
   * The id field in the tag MUST be defined.
   * @returns the updated tag if successful.
   */
  async updateTag(tagId: number, tag: ModifyTagDto): Promise<TagDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(tag);
    const returningClause = generateReturningClause(TagSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(tagId);

    const query = `
      UPDATE tags
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<TagDto>(query, values);

    if (result.length === 0) {
      throw new ResourceNotFoundException(TagDto, tagId);
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

    // * NOTE: We don't check for failures here for idempotency.
    await this.db.query(query, [id]);
  }

  // insert extra functions here if desired
}
