import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { CreateTagDto, ProductionDto, TagDto, UpdateTagDto } from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";
import { DEFAULT_LANGUAGE, Language } from "@repo/common";

@Injectable()
export class TagDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single tag by their ID.
   * @param id The ID we're trying to fetch.
   * @param lang is the language used.
   * @returns The tag if there is one.
   */
  async getTagById(
    id: number,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<TagDto> {
    const query = `
      SELECT
        id,
        tag->>'${lang}' AS name,
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
   * Get all productions listed under a given tag.
   * @param tag the tag we want to get the productions connected to.
   * @param amount is the amount of events per page (returned)
   * @param page is the page you want (indexed from 0)
   * @param lang is the used language
   * @returns a list of productions that fall under the given tag.
   */
  async getProductionsByTag(
    tag: TagDto,
    lang: Language = DEFAULT_LANGUAGE,
    amount: number = 0,
    page: number = 0,
  ): Promise<ProductionDto[]> {
    const selectFields = `
    p.id,
    p.titel->>'${lang}' AS titel,
    p.ondertitel->>'${lang}' AS ondertitel,
    p.description1->>'${lang}' AS desc1,
    p.description2->>'${lang}' AS desc2,
    p.planning_id,
    p.artist->>'${lang}' AS artist,
    p.tagline->>'${lang}' AS tagline,
    p.credits->>'${lang}' AS credits,
    p.created_at,
    p.updated_at,
    p.legacy_id
  `;

    if (amount === 0) {
      const query = `
        SELECT ${selectFields}
        FROM productions p
               JOIN production_tag pt ON p.id = pt.production_id
        WHERE pt.tag_id = $1
      `;
      return await this.db.query(query, [tag.id]);
    }

    const offset = page * amount;

    const query = `
      SELECT ${selectFields}
      FROM productions p
             JOIN production_tag pt ON p.id = pt.production_id
      WHERE pt.tag_id = $1
      LIMIT $2 OFFSET $3
    `;

    return await this.db.query(query, [tag.id, amount, offset]);
  }
  /**
   * Get all tags.
   * @param amount is the amount of events per page (returned)
   * @param page is the page you want (indexed from 0)
   * @param lang is the language used
   * @returns The tags if there are any.
   */
  async getTags(
    amount: number = 0,
    page: number = 0,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<TagDto[]> {
    // non-pagination first
    if (amount === 0) {
      const query = `SELECT id, tag->>'${lang}' AS tag, created_at, updated_at, legacy_id FROM tags`;

      return await this.db.query<TagDto>(query);
    }

    const offset = page * amount;

    const query = `SELECT id, tag->>'${lang}' AS tag FROM tags LIMIT $1 OFFSET $2`;

    return await this.db.query<TagDto>(query, [amount, offset]);
  }

  /**
   * Create tag function, creates a tag in the database.
   * @param tag must be of the type "CreateTag" which has all fields defined besides the primary key id.
   * @param lang is the used language
   * @returns the added tag if it was successful.
   */
  async createTag(
    tag: CreateTagDto,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<TagDto> {
    if (!tag.tag) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO tags (tag, legacy_id)
      VALUES ($1, $2)
      RETURNING
        id,
        tag->>'${lang}' AS tag,
        created_at,
        updated_at,
        legacy_id
      ;
    `;

    const values = [JSON.stringify({ [lang]: tag.tag })];

    const result = await this.db.query<TagDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create tag");
    }

    return result[0];
  }

  /**
   * Update function for tags. Updates the tag in the database.
   * @param tag must be of the type "UpdateTag", gives the freedom to define only what needs to be updated.
   * @param lang is the used language
   * The id field in the tag MUST be defined.
   * @returns the updated tag if successful.
   */
  async updateTag(
    tag: UpdateTagDto,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<TagDto> {
    if (!tag.id) {
      throw new BadRequestException("Tag id is required for update");
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (tag.tag !== undefined) {
      fields.push(`tag = COALESCE(tag, '{}'::jsonb) || $${index++}::jsonb`);
      values.push(JSON.stringify({ [lang]: tag.tag }));
    }

    if (fields.length === 0) {
      throw new BadRequestException("No fields provided to update");
    }

    values.push(tag.id);

    const query = `
      UPDATE tags
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING
        id,
        tag->>'${lang}' AS tag
        created_at,
        updated_at,
        legacy_id
      ;
    `;

    const result = await this.db.query<TagDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException("Tag not found");
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
      throw new ResourceGoneException(`Cannot Delete: Tag with ID ${id} not found`);
    }
  }

  // insert extra functions here if desired
}
