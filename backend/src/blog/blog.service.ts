import { BadRequestException, Injectable } from '@nestjs/common';
import { Blog, CreateBlog, UpdateBlog } from '@repo/common';
import { BlogDatabaseService } from 'src/database/db.blog.service';

@Injectable()
export class BlogService {
  constructor(private readonly blogDbService: BlogDatabaseService) {}

  async getAllBlogs(): Promise<Blog[]> {
    return await this.blogDbService.getBlogs();
  }

  async getBlogById(id: number): Promise<Blog> {
    return await this.blogDbService.getBlogById(id);
  }

  async createBlog(blog: CreateBlog): Promise<Blog> {
    return await this.blogDbService.createBlog(blog);
  }

  async replaceBlog(id: number, blog: Blog): Promise<Blog> {
    if (blog.id !== id)
      throw new BadRequestException("Blog ID and URL ID do not match. Cannot replace Blog.")
    
    return await this.blogDbService.updateBlog(blog);
  }

  async modifyBlog(id: number, blog: UpdateBlog): Promise<Blog> {
    blog.id = id;
    return await this.blogDbService.updateBlog(blog);
  }

  async deleteBlog(id: number): Promise<void> {
    return await this.blogDbService.deleteBlog(id);
  }
}
