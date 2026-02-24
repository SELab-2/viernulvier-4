import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogSchema, CreateBlogSchema, UpdateBlogSchema } from '@repo/common';
import { ZodValidationPipe } from '../common/pipes/zod.validation.pipe';
import { BlogDto, CreateBlogDto, UpdateBlogDto } from '../dto/dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiOperation({ summary: "Returns all blogs." })
  @ApiOkResponse({ type: BlogDto, isArray: true, description: "Returned all blogs." })
  @Get()
  async getAllBlogs(): Promise<BlogDto[]> {
    return await this.blogService.getAllBlogs();
  }

  @ApiOperation({ summary: "Returns a single blog." })
  @ApiOkResponse({ type: BlogDto, description: "Found Blog." })
  @Get(":id")
  async getBlogById(@Param("id", ParseIntPipe) id: number): Promise<BlogDto> {
    return await this.blogService.getBlogById(id);
  }

  @ApiOperation({ summary: "Creates a new blog." })
  @ApiBody({ type: CreateBlogDto })
  @ApiOkResponse({ type: BlogDto, description: "Created a new Blog." })
  @Post()
  async createBlog(
    @Body(new ZodValidationPipe(CreateBlogSchema)) createBlog: CreateBlogDto
  ): Promise<BlogDto> {
    return await this.blogService.createBlog(createBlog);
  }

  @ApiOperation({ summary: "Replaces an existing blog." })
  @ApiBody({ type: BlogDto })
  @ApiOkResponse({ type: BlogDto, description: "Replaced Blog." })
  @Put(":id")
  async replaceBlog(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(BlogSchema)) blog: BlogDto,
  ): Promise<BlogDto> {
    return await this.blogService.replaceBlog(id, blog);
  }

  @ApiOperation({ summary: "Modifies an existing blog." })
  @ApiBody({ type: UpdateBlogDto })
  @ApiOkResponse({ type: BlogDto, description: "Modified Blog." })
  @Patch(":id")
  async modifyBlog(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateBlogSchema)) blog: UpdateBlogDto,
  ): Promise<BlogDto> {
    return await this.blogService.modifyBlog(id, blog);
  }

  @ApiOperation({ summary: "Delete an existing blog." })
  @ApiOkResponse({ description: "Deleted Blog." })
  @Delete(":id")
  async deleteBlog(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.blogService.deleteBlog(id);
  }
}
