import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  BlogDto,
  CreateBlogDto,
  MediaGalleryDto,
  PaginationFilterDto,
  ReplaceBlogDto,
  ModifyBlogDto,
  FilterBlogDto,
} from "../dto/dto";
import {
  BlogSchema,
  GalleryType,
  MediaGallerySchema,
  PaginatedResponse,
  SUPPORTED_LANGUAGES,
} from "@repo/common";
import {
  generateInsertClause,
  generateReturningClause,
  generateUpdateClause,
} from "./db-utils";
import {
  MediaNotFoundException,
  ResourceNotFoundException,
} from "../common/exceptions";

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
    const returningClause = generateReturningClause(BlogSchema);

    const query = `
      SELECT ${returningClause}
      FROM blogs WHERE id = $1;
    `;

    const result = await this.db.query<BlogDto>(query, [id]);

    if (result.length === 0) {
      throw new ResourceNotFoundException(BlogDto, id);
    }

    return result[0];
  }

  /**
   * Get blogs with pagination
   * @param paginationFilters Filters for pagination and ordering.
   * @param blogFilters Filters for blogs.
   * @returns blogs
   */
  async getBlogs(
    paginationFilters: PaginationFilterDto,
    blogFilters: FilterBlogDto,
  ): Promise<PaginatedResponse<BlogDto>> {
    const returningClause = generateReturningClause(BlogSchema);

    const conditions: string[] = [];
    const values: (string | number)[] = [];
    const param = (val: string | number) => {
      values.push(val);
      return `$${values.length}`;
    };

    // Title filter
    // NOTE: This is case-insensitive and looks in all languages + matches on parts.
    if (blogFilters.title) {
      const titleParam = param(`%${blogFilters.title}%`);
      const titelClauses = SUPPORTED_LANGUAGES.map(
        (lang) => `titel->>'${lang}' ILIKE ${titleParam}`,
      );
      conditions.push(`(${titelClauses.join(" OR ")})`);
    }

    // Filter blogs that were created before.
    if (blogFilters.before) {
      conditions.push(
        // NOTE: We add + 1 day here for performance and include reasons.
        `created_at < ${param(blogFilters.before)}::date + interval '1 day'`,
      );
    }

    // Filter blogs that were created after.
    if (blogFilters.after) {
      conditions.push(`created_at >= ${param(blogFilters.after)}::date`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const filterValues = [...values];
    const countQuery = `
      SELECT COUNT(*) as count FROM blogs
      ${whereClause};
    `;

    // pagination
    const offset = paginationFilters.page * paginationFilters.limit;
    const paginationClause = `LIMIT ${param(paginationFilters.limit)} OFFSET ${param(offset)}`;

    const query = `
      SELECT ${returningClause}
      FROM blogs
      ${whereClause}
      ORDER BY created_at ${paginationFilters.descending ? "DESC" : "ASC"}
      ${paginationClause};
    `;

    // Fetch count and objects.
    const [objects, countResult] = await Promise.all([
      this.db.query<BlogDto>(query, values),
      this.db.query<{ count: string }>(countQuery, filterValues),
    ]);

    return {
      limit: paginationFilters.limit,
      page: paginationFilters.page,
      totalItems: parseInt(countResult[0].count),
      objects: objects,
    };
  }

  /**
   * Create blog function, creates a blog in the database.
   * @param blog must be of the type "CreateBlog" which has all fields defined besides the primary key id.
   * @returns the added blog if it was successful.
   */
  async createBlog(blog: CreateBlogDto): Promise<BlogDto> {
    const { columns, placeholders, values } = generateInsertClause(blog);
    const returningClause = generateReturningClause(BlogSchema);

    const query = `
      INSERT INTO blogs (${columns})
      VALUES (${placeholders})
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<BlogDto>(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create blog.");
    }

    return result[0];
  }

  /**
   * Update function for blogs. Updates the blog in the database.
   * @param blogId The ID of the blog.
   * @param blog must be of the type "ModifyBlog" or "ReplaceBlog", gives the freedom to define only what needs to be updated.
   * @returns the updated blog if successful.
   */
  async updateBlog(
    blogId: number,
    blog: ModifyBlogDto | ReplaceBlogDto,
  ): Promise<BlogDto> {
    const { setClause, values, nextIndex } = generateUpdateClause(blog);
    const returningClause = generateReturningClause(BlogSchema);

    if (values.length === 0) {
      throw new BadRequestException("No valid fields provided for update.");
    }

    values.push(blogId);

    const query = `
      UPDATE blogs
      SET ${setClause}
      WHERE id = $${nextIndex}
      RETURNING ${returningClause};
    `;

    const result = await this.db.query<BlogDto>(query, values);

    if (result.length === 0) {
      throw new ResourceNotFoundException(BlogDto, blogId);
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

    // * NOTE: We don't check for failures here for idempotency.
    await this.db.query(query, [blogId]);
  }

  /**
   * Gets media gallery linked to a given blog with the given type.
   * @param blog_id The ID of the blog you want.
   * @param type The type of gallery you want.
   * @returns The MediaGallery of given type if it exists.
   */
  async getMediaFromBlog(
    blog_id: number,
    type: GalleryType,
  ): Promise<MediaGalleryDto> {
    const galleryPrefix = "mg";
    const returningClause = generateReturningClause(
      MediaGallerySchema,
      galleryPrefix,
    );

    const query = `
      SELECT ${returningClause}
      FROM media_gallery ${galleryPrefix}
      INNER JOIN blog_media_gallery bmg ON bmg.gallery_id = ${galleryPrefix}.id
      WHERE bmg.blog_id = $1 AND ${galleryPrefix}.type = $2
      ORDER BY ${galleryPrefix}.id
      LIMIT 1;
    `;

    const result = await this.db.query<MediaGalleryDto>(query, [blog_id, type]);

    if (result.length === 0) {
      throw new MediaNotFoundException(BlogDto, type, blog_id);
    }

    return result[0];
  }

  /**
   * Links a media gallery to a given blog.
   * @param blog_id The ID of the blog to link to.
   * @param gallery_id The ID of the media gallery to link.
   * @returns void
   */
  async linkMediaToBlog(blog_id: number, gallery_id: number): Promise<void> {
    const query = `
      INSERT INTO blog_media_gallery (blog_id, gallery_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;

    await this.db.query(query, [blog_id, gallery_id]);
  }

  /**
   * Unlinks a media gallery from a given blog.
   * @param blog_id The ID of the blog.
   * @param gallery_id The ID of the media gallery to unlink.
   */
  async unlinkMediaFromBlog(
    blog_id: number,
    gallery_id: number,
  ): Promise<void> {
    const query = `
      DELETE FROM blog_media_gallery
      WHERE blog_id = $1 AND gallery_id = $2
    `;

    await this.db.query(query, [blog_id, gallery_id]);
  }
}
