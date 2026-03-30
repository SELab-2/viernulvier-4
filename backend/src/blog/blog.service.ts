import { Injectable } from "@nestjs/common";
import { BlogDatabaseService } from "../database/db.blog.service";
import {
  BlogDto,
  CreateBlogDto,
  MediaGalleryDto,
  PaginationFilterDto,
  ReplaceBlogDto,
  ModifyBlogDto,
  FilterBlogDto,
} from "../dto/dto";
import { PaginatedResponse } from "@repo/common";

@Injectable()
export class BlogService {
  constructor(private readonly blogDbService: BlogDatabaseService) {}

  /**
   * Gets all Blogs from the DatabaseService.
   * @param paginationFilters Filters for pagination and ordering.
   * @param blogFilters Filters for blog dates.
   * @returns A list of all Blog objects.
   */
  async getAllBlogs(
    paginationFilters: PaginationFilterDto,
    blogFilters: FilterBlogDto,
  ): Promise<PaginatedResponse<BlogDto>> {
    return await this.blogDbService.getBlogs(paginationFilters, blogFilters);
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
  async replaceBlog(id: number, blog: ReplaceBlogDto): Promise<BlogDto> {
    return await this.blogDbService.updateBlog(id, blog);
  }

  /**
   * Modifies an existing Blog using the DatabaseService.
   * @param id The ID of the Blog we want to modify.
   * @param blog The Partial Blog object we want to use to modify.
   * @returns The newly modified Blog.
   */
  async modifyBlog(id: number, blog: ModifyBlogDto): Promise<BlogDto> {
    return await this.blogDbService.updateBlog(id, blog);
  }

  /**
   * Deletes a Blog from the DatabaseService.
   * @param id The ID of the Blog we want to delete.
   * @returns Nothing.
   */
  async deleteBlog(id: number): Promise<void> {
    return await this.blogDbService.deleteBlog(id);
  }

  // -- Media -- //

  /**
   * Fetches the media related to a blog.
   * @param blogId The ID of the blog.
   * @returns The media gallery.
   */
  async getMedia(blogId: number): Promise<MediaGalleryDto> {
    return await this.blogDbService.getMediaFromBlog(blogId);
  }

  /**
   * Link a media gallery to a blog.
   * @param blogId The ID of the blog.
   * @param galleryId The ID of the Gallery.
   */
  async linkMediaToBlog(blogId: number, galleryId: number): Promise<void> {
    await this.blogDbService.linkMediaToBlog(blogId, galleryId);
  }

  /**
   * Unlink a media gallery from a blog.
   * @param blogId The ID of the blog.
   * @param galleryId The ID of the Gallery.
   */
  async unlinkMediaFromBlog(blogId: number, galleryId: number): Promise<void> {
    await this.blogDbService.unlinkMediaFromBlog(blogId, galleryId);
  }
}
