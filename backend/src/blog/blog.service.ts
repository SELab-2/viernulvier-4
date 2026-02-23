import { Injectable } from '@nestjs/common';
import { Blog, CreateBlog, UpdateBlog } from '@repo/common';
import { BlogDatabaseService } from 'src/database/db.blog.service';

@Injectable()
export class BlogService {
  constructor(private readonly blogDbService: BlogDatabaseService) {}

  async getAllBlogs(): Promise<Blog[]> {
    return await [];
  }

  async getBlogById(id: number): Promise<Blog> {
    return await this.blogDbService.getBlogById(id);
  }

  async createBlog(blog: CreateBlog): Promise<Blog> {
    return await this.blogDbService.createBlog(blog);
  }

  async updateBlog(blog: UpdateBlog): Promise<Blog> {
    return await this.blogDbService.updateBlog(blog);
  }

  async deleteBlog(id: number): Promise<void> {
    return await this.blogDbService.deleteBlog(id);
  }
}
