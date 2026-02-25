import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { BlogDto, CreateBlogDto, UpdateBlogDto } from "../dto/dto";

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
    const query = `SELECT * FROM blogs WHERE id = $1`;

    const result = await this.db.query(query, [id]);

    if (result.length === 0) {
      throw new Error("Blog not found");
    }
    return result[0];
  }

  /**
   * Get a single Blog by their ID.
   * @returns All blogs.
   */
  async getBlogs(): Promise<BlogDto[]> {
    const query = `SELECT * FROM blogs`;

    const result = await this.db.query(query);

    if (result.length === 0) {
      throw new Error("no blogs found");
    }
    return result;
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
    INSERT INTO blogs (
      titel,
      description
    )
    VALUES ($1, $2)
    RETURNING id, titel, description;
  `;

    const values = [blog.titel, blog.description];

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
  async updateBlog(blog: UpdateBlogDto): Promise<BlogDto> {
    if (!blog.id) {
      throw new Error("Blog id is required for update");
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (blog.titel !== undefined) {
      fields.push(`titel = $${index++}`);
      values.push(blog.titel);
    }

    if (blog.description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(blog.description);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    // Add id as final parameter
    values.push(blog.id);

    // ignore "RETURNING" error, query is correct.
    const query = `
    UPDATE blogs
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id, titel, description;
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
