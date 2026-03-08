import { BadRequestException, Injectable } from "@nestjs/common";
import { BlogDatabaseService } from "../database/db.blog.service";
import { BlogDto, CreateBlogDto, UpdateBlogDto } from "../dto/dto";

@Injectable()
export class BlogService {
  constructor(private readonly blogDbService: BlogDatabaseService) {}

  /**
   * Gets all Blogs from the DatabaseService.
   * @returns A list of all Blog objects.
   */
  async getAllBlogs(): Promise<BlogDto[]> {
    return await this.blogDbService.getBlogs();
  }

  /**
   * Fetches a single Blog from the DatabaseService based on an ID.
   * @param id The ID of the Blog we want to fetch.
   * @returns The fetched Blog.
   */
  async getBlogById(id: number): Promise<BlogDto> {
    return await this.blogDbService.getBlogById(id);
  }

  /**
   * Creates a Blog using the DatabaseService.
   * @param blog The Blueprint for the Blog we want to create.
   * @returns The newly created Blog.
   */
  async createBlog(blog: CreateBlogDto): Promise<BlogDto> {
    return await this.blogDbService.createBlog(blog);
  }

  /**
   * Replaces an existing Blog using the DatabaseService.
   * @param id The ID of the Blog we want to replace.
   * @param blog The Blog object we want to replace the existing Blog with.
   * @returns The newly replaced Blog.
   */
  async replaceBlog(id: number, blog: UpdateBlogDto): Promise<BlogDto> {
    if (blog.id !== id)
      throw new BadRequestException(
        "Blog ID and URL ID do not match. Cannot replace Blog.",
      );

    return await this.blogDbService.updateBlog(blog);
  }

  /**
   * Modifies an existing Blog using the DatabaseService.
   * @param id The ID of the Blog we want to modify.
   * @param blog The Partial Blog object we want to use to modify.
   * @returns The newly modified Blog.
   */
  async modifyBlog(id: number, blog: UpdateBlogDto): Promise<BlogDto> {
    blog.id = id;
    return await this.blogDbService.updateBlog(blog);
  }

  /**
   * Deletes a Blog from the DatabaseService.
   * @param id The ID of the Blog we want to delete.
   * @returns Nothing.
   */
  async deleteBlog(id: number): Promise<void> {
    return await this.blogDbService.deleteBlog(id);
  }
}
