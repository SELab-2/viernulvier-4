import { BadRequestException, Injectable } from '@nestjs/common';
import { BlogDatabaseService } from 'src/database/db.blog.service';
import { BlogDto, CreateBlogDto, UpdateBlogDto } from 'src/dto/dto';

@Injectable()
export class BlogService {
  constructor(private readonly blogDbService: BlogDatabaseService) {}

  async getAllBlogs(): Promise<BlogDto[]> {
    return await this.blogDbService.getBlogs();
  }

  async getBlogById(id: number): Promise<BlogDto> {
    return await this.blogDbService.getBlogById(id);
  }

  async createBlog(blog: CreateBlogDto): Promise<BlogDto> {
    return await this.blogDbService.createBlog(blog);
  }

  async replaceBlog(id: number, blog: BlogDto): Promise<BlogDto> {
    if (blog.id !== id)
      throw new BadRequestException("Blog ID and URL ID do not match. Cannot replace Blog.")
    
    return await this.blogDbService.updateBlog(blog);
  }

  async modifyBlog(id: number, blog: UpdateBlogDto): Promise<BlogDto> {
    blog.id = id;
    return await this.blogDbService.updateBlog(blog);
  }

  async deleteBlog(id: number): Promise<void> {
    return await this.blogDbService.deleteBlog(id);
  }
}
