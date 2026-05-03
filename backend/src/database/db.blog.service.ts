import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  BlogDto,
  CreateBlogDto,
  FilterBlogDto,
  MediaGalleryDto,
  ModifyBlogDto,
  PaginationFilterDto,
  ReplaceBlogDto,
} from "../dto/dto";
import {
  BlogSchema,
  GalleryType,
  Language,
  MediaGallerySchema,
  PaginatedResponse,
  SUPPORTED_LANGUAGES,
} from "@repo/common";
import {
  generateInsertClause,
  generateRelevanceClause,
  generateReturningClause,
  generateUpdateClause,
  PostgresError,
} from "./db-utils";
import {
  InvalidReferenceException,
  MediaNotFoundException,
  ResourceNotFoundException,
  SystemFailureException,
} from "../common/exceptions";

@Injectable()
export class BlogDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single Blog by their ID.
   * @param id The ID we're trying to fetch.
   * @returns The Blog if there is one.
   * @throws ResourceNotFoundException if there is no blog with the asked id. (404)
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
   * @param language Optional language to use for text filtering.
   * @returns blogs
   */
  async getBlogs(
    paginationFilters: PaginationFilterDto,
    blogFilters: FilterBlogDto,
    language?: Language,
  ): Promise<PaginatedResponse<BlogDto>> {
    const returningClause = generateReturningClause(BlogSchema);

    const conditions: string[] = [];
    const values: (string | number)[] = [];
    const param = (val: string | number) => {
      values.push(val);
      return `$${values.length}`;
    };

    // Title filter
    // Looks into the language provided and filters differently based on
    // Whether the query is a suggestion or not.
    if (blogFilters.title) {
      const searchTerm = blogFilters.title;

      const allClauses = SUPPORTED_LANGUAGES.flatMap((lang) => {
        if (language && language !== lang) return [];

        const titleField = `titel->>'${lang}'`;

        if (blogFilters.is_suggestion) {
          const pSearch = param(searchTerm);
          return [`word_similarity(${pSearch}, ${titleField}) > 0.3`];
        } else {
          const pSearch = param(`%${searchTerm}%`);
          return [`${titleField} ILIKE ${pSearch}`];
        }
      });

      // Push them as a single string wrapped in parentheses, joined by OR
      if (allClauses.length > 0) {
        conditions.push(`(${allClauses.join(" OR ")})`);
      }
    }

    // Filter blogs that were created before.
    if (blogFilters.before) {
      conditions.push(
        // NOTE: We add + 1 day here for performance and include reasons.
        // Adding 1 day is a more performant than casting the original column to a
        // date.
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

    // Ordering (relevance vs date)
    let orderClause: string;
    if (blogFilters.is_suggestion && blogFilters.title) {
      const relevanceMath = generateRelevanceClause(
        blogFilters.title,
        [{ name: `titel` }],
        param,
        language,
      );

      orderClause = `ORDER BY ${relevanceMath} DESC`;
    } else {
      orderClause = `ORDER BY created_at ${paginationFilters.descending ? "DESC" : "ASC"}`;
    }

    const query = `
      SELECT ${returningClause}
      FROM blogs
      ${whereClause}
      ${orderClause}
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
   * @throws SystemFailureException if something went wrong while creating the blog.(500)
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
      throw new SystemFailureException("Failed to create blog.");
    }

    return result[0];
  }

  /**
   * Update function for blogs. Updates the blog in the database.
   * @param blogId The ID of the blog.
   * @param blog must be of the type "ModifyBlog" or "ReplaceBlog", gives the freedom to define only what needs to be updated.
   * @returns the updated blog if successful.
   * @throws BadRequestException if there were no fields provided for updating. (400)
   * @throws ResourceNotFoundException if there was no blog with the provided id. (404)
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
   * @throws MediaNotFoundException if there was no media linked to the blog.(404)
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
   * @throws InvalidReferenceException if you try to link with one or more invalid ids. (404)
   * @throws SystemFailureException if something else goes wrong. (500)
   */
  async linkMediaToBlog(blog_id: number, gallery_id: number): Promise<void> {
    const query = `
      INSERT INTO blog_media_gallery (blog_id, gallery_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;

    try {
      await this.db.query(query, [blog_id, gallery_id]);
    } catch (error: unknown) {
      const dbError = error as PostgresError;

      // Catch Postgres error code 23503: foreign_key_violation
      if (dbError?.code === "23503") {
        throw new InvalidReferenceException();
      }

      throw SystemFailureException;
    }
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
