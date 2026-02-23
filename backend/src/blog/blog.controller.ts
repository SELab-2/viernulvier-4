import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { BlogService } from './blog.service';
import type { Blog, CreateBlog, UpdateBlog } from "@repo/common";
import { BlogSchema, CreateBlogSchema, UpdateBlogSchema } from '@repo/common';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getAllBlogs(): Promise<Blog[]> {
    return await this.blogService.getAllBlogs();
  }

  @Get(":id")
  async getBlogById(@Param("id", ParseIntPipe) id: number): Promise<Blog> {
    return await this.blogService.getBlogById(id);
  }

  @Post()
  async createBlog(
    @Body(new ZodValidationPipe(CreateBlogSchema)) createBlog: CreateBlog
  ): Promise<Blog> {
    return await this.blogService.createBlog(createBlog);
  }

  @Put(":id")
  async replaceBlog(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(BlogSchema)) blog: Blog,
  ): Promise<Blog> {
    return await this.blogService.replaceBlog(id, blog);
  }

  @Patch(":id")
  async modifyBlog(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateBlogSchema)) blog: UpdateBlog,
  ): Promise<Blog> {
    return await this.blogService.modifyBlog(id, blog);
  }

  @Delete(":id")
  async deleteBlog(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.blogService.deleteBlog(id);
  }
}
