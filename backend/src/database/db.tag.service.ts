import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { CreateTag, UpdateTag, Tag } from "@repo/common";

@Injectable()
export class TagDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  // note: no update-tag-function as it is not necessary. If you want, you can just remove and add a new tag instead.

  /**
   * Get a single tag by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The tag if there is one.
   */
  async getTagById(id: number): Promise<Tag> {
    const query = `SELECT * FROM tags WHERE id = $1`;

    const result = await this.db.query(query, [id]);

    if (result.length === 0) {
      throw new Error("Blog not found");
    }
    return result[0];
  }

  /**
   * Get tags by their production ID.
   * @param production_id The ID we're trying to fetch.
   * @returns The tags if there are any.
   */
  async getTagsByProductionID(production_id: number): Promise<Tag[]> {
    const query = `SELECT * FROM tags WHERE production_id = $1`;

    const result = await this.db.query(query, [production_id]);

    if (result.length === 0) {
      throw new Error("No tags found for this production");
    }
    return result;
  }

  /**
   * Create tag function, creates a tag in the database.
   * @param tag must be of the type "CreateTag" which has all fields defined besides the primary key id.
   * @returns the added tag if it was successful.
   */
  async createTag(tag: CreateTag): Promise<Tag> {
    if (!tag.production_id || !tag.tag) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
    INSERT INTO tags (
      production_id,
      tag
    )
    VALUES ($1, $2)
    RETURNING id, production_id, tag;
  `;

    const values = [tag.production_id, tag.tag];

    const result = await this.db.query<Tag>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create tag");
    }

    return result[0];
  }

  async getAllTags(): Promise<Tag[]> {
    const query = `SELECT * FROM tags`;

    const result = await this.db.query<Tag>(query);

    return result;
  }

  async updateTag(id: number, tag: UpdateTag): Promise<Tag> {
    if (!tag.tag) {
      throw new BadRequestException("Missing required fields: tag");
    }
    const query = `
        UPDATE tags
        SET tag = $1
        WHERE id = $2
        RETURNING *;
      `;
      const params = [tag.tag, id];
      const result = await this.db.query(query, params);
      if (result.length === 0) {
        throw new Error("Failed to update tag");
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
    const query = `DELETE FROM tags WHERE id = $1`;

    await this.db.query(query, [id]);
  }

  /**
   * Delete function for deleting tags from the database.
   * note: deletes all tags with a corresponding production_id
   * @param production_id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteTagsWithProductionID(production_id: number): Promise<void> {
    const query = `DELETE FROM tags WHERE production_id = $1`;

    await this.db.query(query, [production_id]);
  }

  // insert extra functions here if desired
}
