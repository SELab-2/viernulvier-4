import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { CreateTag, Tag } from "@repo/common";

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
      throw new Error("Tag not found");
    }
    return result[0];
  }

  /**
   * Get all tags.
   * @returns The tags if there are any.
   */
  async getTags(): Promise<Tag[]> {
    const query = `SELECT * FROM tags`;

    const result = await this.db.query(query);

    if (result.length === 0) {
      throw new Error("no tags found");
    }
    return result;
  }

  /**
   * Create tag function, creates a tag in the database.
   * @param tag must be of the type "CreateTag" which has all fields defined besides the primary key id.
   * @returns the added tag if it was successful.
   */
  async createTag(tag: CreateTag): Promise<Tag> {
    if (!tag.tag) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
    INSERT INTO tags (
      tag
    )
    VALUES ($1)
    RETURNING id, tag;
  `;

    const values = [tag.tag];

    const result = await this.db.query<Tag>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create tag");
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

  // insert extra functions here if desired

  // TODO DISTINCT query
}
