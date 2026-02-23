import { Controller, Get } from '@nestjs/common';
import { BlogService } from './blog.service';
import { Blog } from '@repo/common';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getAllBlogs(): Promise<Blog[]> {
    return await this.blogService.getAllBlogs();
  }
}
