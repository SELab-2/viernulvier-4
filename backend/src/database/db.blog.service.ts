import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { BlogDto, CreateBlogDto, UpdateBlogDto } from "../dto/dto";
import { ResourceGoneException } from "../common/exceptions";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class BlogDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single Blog by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The Blog if there is one.
   */
  async getBlogById(id: number): Promise<BlogDto> {
    const query = `SELECT id, 
       titel, 
       description, 
       created_at, 
       updated_at
    FROM blogs WHERE id = $1`;

    const result = await this.db.query<BlogDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceGoneException(`Blog with ID ${id} not found`);
    }
    return result[0];
  }

  /**
   * Get blogs with pagination
   * @param amount number of blogs per page (if amount=0, it will default to grabbing all blogs)
   * @param page page index (starts at 0)
   * @returns blogs
   */
  async getBlogs(
    amount: number = 0,
    page: number = 0,
  ): Promise<PaginatedResponse<BlogDto>> {
    const offset = page * amount;
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM blogs`,
    );
    if (amount === 0) {
      const query = `
      SELECT id, 
             titel, 
             description,
             created_at,
             updated_at
      FROM blogs
      ORDER BY id
      `;

      return {
        limit: amount,
        page: page,
        totalItems: parseInt(countResult[0].count),
        objects: await this.db.query<BlogDto>(query, [amount, offset]),
      };
    }

    const query = `
    SELECT id,
           titel,
           description,
           created_at,
           updated_at
    FROM blogs
    ORDER BY id
    LIMIT $1 OFFSET $2
    `;

    return {
      limit: amount,
      page: page,
      totalItems: parseInt(countResult[0].count),
      objects: await this.db.query<BlogDto>(query, [amount, offset]),
    };
  }

  /**
   * Create blog function, creates a blog in the database.
   * @param blog must be of the type "CreateBlog" which has all fields defined besides the primary key id.
   * @returns the added blog if it was successful.
   */
  async createBlog(blog: CreateBlogDto): Promise<BlogDto> {
    if (!blog.titel || !blog.description) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      INSERT INTO blogs (titel, description)
      VALUES ($1, $2)
      RETURNING
        id,
        titel,
        description,
        created_at,
        updated_at;
    `;

    const values = [
      JSON.stringify(blog.titel),
      JSON.stringify(blog.description),
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
   * The id field in the blog MUST be defined.
   * @returns the updated blog if successful.
   */
  async updateBlog(blogId: number, blog: UpdateBlogDto): Promise<BlogDto> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (blog.titel !== undefined) {
      fields.push(`titel = COALESCE(titel, '{}'::jsonb) || $${index++}::jsonb`);
      values.push(JSON.stringify(blog.titel));
    }

    if (blog.description !== undefined) {
      fields.push(
        `description = COALESCE(description, '{}'::jsonb) || $${index++}::jsonb`,
      );
      values.push(JSON.stringify(blog.description));
    }

    if (fields.length === 0) {
      throw new BadRequestException("No fields provided to update");
    }

    values.push(blogId);

    const query = `
      UPDATE blogs
      SET ${fields.join(", ")}
      WHERE id = $${index}
    RETURNING
      id,
      titel,
      description,
      created_at,
      updated_at;
  `;

    const result = await this.db.query<BlogDto>(query, values);

    if (result.length === 0) {
      throw new ResourceGoneException(
        `Cannot update: Blog ${blogId} not found`,
      );
    }

    return result[0];
  }

  /**
   * Delete function for deleting blogs from the database.
   * @param blogId must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * @returns nothing.
   */
  async deleteBlog(blogId: number): Promise<void> {
    const query = `DELETE FROM blogs WHERE id = $1 RETURNING id;`;
    const result = await this.db.query(query, [blogId]);
    if (result.length == 0) {
      throw new ResourceGoneException(
        `Cannot delete: Blog ${blogId} not found`,
      );
    }
  }

  // insert extra functions here if desired.
}
