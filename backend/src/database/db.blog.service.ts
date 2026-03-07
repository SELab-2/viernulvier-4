import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { BlogDto, CreateBlogDto, UpdateBlogDto } from "../dto/dto";
import { DEFAULT_LANGUAGE, Language } from "@repo/common";

@Injectable()
export class BlogDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single Blog by their ID.
   * @param id The ID we're trying to fetch.
   * @param lang is the used language
   * @returns The Blog if there is one.
   */
  async getBlogById(
    id: number,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<BlogDto> {
    const query = `SELECT id, 
       titel->>'${lang}' AS titel, 
       description->>'${lang}' AS description, 
       created_at, 
       updated_at, 
       legacy_id 
    FROM blogs WHERE id = $1`;

    const result = await this.db.query<BlogDto>(query, [id]);

    if (result.length === 0) {
      throw new Error("Blog not found");
    }
    return result[0];
  }

  /**
   * Get blogs with pagination
   * @param amount number of blogs per page (if amount=0, it will default to grabbing all blogs)
   * @param page page index (starts at 0)
   * @param lang is the used language
   * @returns blogs
   */
  async getBlogs(
    amount: number = 0,
    page: number = 0,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<BlogDto[]> {
    const offset = page * amount;

    if (amount === 0) {
      const query = `
      SELECT id, 
             titel->>'${lang}' AS titel, 
             description->>'${lang}' AS description,
             created_at,
             updated_at,
             legacy_id
      FROM blogs
      ORDER BY id
      `;

      const result = await this.db.query<BlogDto>(query);

      if (result.length === 0) {
        throw new Error("no blogs found");
      }

      return result;
    }

    let query = `
    SELECT id,
           titel->>'${lang}' AS titel,
           description->>'${lang}' AS description,
           created_at,
           updated_at,
           legacy_id
    FROM blogs
    ORDER BY id
    LIMIT $1 OFFSET $2
    `;

    const result = await this.db.query<BlogDto>(query, [amount, offset]);

    if (result.length === 0) {
      throw new Error("no blogs found");
    }

    return result;
  }

  /**
   * Create blog function, creates a blog in the database.
   * @param blog must be of the type "CreateBlog" which has all fields defined besides the primary key id.
   * @param lang is the used language
   * @returns the added blog if it was successful.
   */
  async createBlog(
    blog: CreateBlogDto,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<BlogDto> {
    if (!blog.titel || !blog.description) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO blogs (titel, description, legacy_id)
      VALUES ($1, $2)
      RETURNING
        id,
        titel->>'${lang}' AS titel,
        description->>'${lang}' AS description,
        created_at,
        updated_at,
        legacy_id;
    `;

    const values = [
      JSON.stringify({ [lang]: blog.titel }),
      JSON.stringify({ [lang]: blog.description }),
    ];

    const result = await this.db.query<BlogDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create blog");
    }

    return result[0];
  }

  /**
   * Update function for blogs. Updates the blog in the database.
   * @param blog must be of the type "UpdateBlog", gives the freedom to define only what needs to be updated.
   * @param lang is the used language
   * The id field in the blog MUST be defined.
   * @returns the updated blog if successful.
   */
  async updateBlog(
    blog: UpdateBlogDto,
    lang: Language = DEFAULT_LANGUAGE,
  ): Promise<BlogDto> {
    if (!blog.id) {
      throw new Error("Blog id is required for update");
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (blog.titel !== undefined) {
      fields.push(`titel = COALESCE(titel, '{}'::jsonb) || $${index++}::jsonb`);
      values.push(JSON.stringify({ [lang]: blog.titel }));
    }

    if (blog.description !== undefined) {
      fields.push(
        `description = COALESCE(description, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify({ [lang]: blog.description }));
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    values.push(blog.id);

    const query = `
      UPDATE blogs
      SET ${fields.join(", ")}
      WHERE id = $${index}
    RETURNING
      id,
      titel->>'${lang}' AS titel,
      description->>'${lang}' AS description,
      created_at,
      updated_at,
      legacy_id;
  `;

    const result = await this.db.query<BlogDto>(query, values);

    if (result.length === 0) {
      throw new Error("Blog not found");
    }

    return result[0];
  }

  /**
   * Delete function for deleting blogs from the database.
   * @param id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteBlog(id: number): Promise<void> {
    const query = `DELETE FROM blogs WHERE id = $1`;

    await this.db.query(query, [id]);
  }

  // insert extra functions here if desired.
}
