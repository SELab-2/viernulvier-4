import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BlogService } from "./blog.service";
import {
  BlogSchema,
  CreateBlogSchema,
  LanguageQuerySchema,
  PaginatedResponse,
  PaginationFilterSchema,
  UpdateBlogSchema,
} from "@repo/common";
import { ZodValidationPipe } from "../common/pipes/zod.validation.pipe";
import {
  BlogDto,
  BlogViewDto,
  CreateBlogDto,
  LanguageQueryDto,
  PaginationFilterDto,
  UpdateBlogDto,
} from "../dto/dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";
import { LanguageService } from "../util/language/language.service";
import {
  ApiOkAnyOf,
  ApiOkPaginatedResponseAnyOf,
} from "../common/decorators/api.ok";

@Controller("blogs")
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to a GET to "/blogs"
   * @param paginationFilter is the pagination params
   * @param lang is the language filter
   * @returns A list of all Blog objects.
   */
  @ApiOperation({ summary: "Returns all blogs." })
  @ApiOkPaginatedResponseAnyOf(BlogDto, BlogViewDto)
  @Get()
  async getAllBlogs(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<PaginatedResponse<BlogDto | BlogViewDto>> {
    const result = await this.blogService.getAllBlogs(paginationFilter);
    return this.ls.flattenByLanguage<PaginatedResponse<BlogDto | BlogViewDto>>(
      result,
      lang.lang,
    );
  }

  /**
   * Responds to a GET to "/blogs/:blogId"
   * @param blogId The ID of the Blog that will be fetched.
   * @returns The Blog corresponding to ID if there was one.
   */
  @ApiOperation({ summary: "Returns a single blog." })
  @ApiOkAnyOf(BlogDto, BlogViewDto)
  @Get(":blogId")
  async getBlogById(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<BlogDto | BlogViewDto> {
    return this.ls.flattenByLanguage<BlogDto | BlogViewDto>(
      await this.blogService.getBlogById(blogId),
      lang.lang,
    );
  }

  /**
   * Responds to a POST to "/blogs"
   * @param createBlog The Blog object that should be created, excluding the id.
   * @returns The newly created Blog object.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new blog." })
  @ApiBody({ type: CreateBlogDto })
  @ApiOkResponse({ type: BlogDto, description: "Created a new Blog." })
  @Post()
  async createBlog(
    @Body(new ZodValidationPipe(CreateBlogSchema)) createBlog: CreateBlogDto,
  ): Promise<BlogDto> {
    return await this.blogService.createBlog(createBlog);
  }

  /**
   * Responds to a PUT to "/blogs/:blogId"
   * @param blogId The ID of the Blog we want to replace.
   * @param blog The Blog we want to replace it with.
   * @returns The replaced Blog.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Replaces an existing blog." })
  @ApiBody({ type: UpdateBlogDto })
  @ApiOkResponse({ type: BlogDto, description: "Replaced Blog." })
  @Put(":blogId")
  async replaceBlog(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Body(new ZodValidationPipe(BlogSchema)) blog: UpdateBlogDto,
  ): Promise<BlogDto> {
    return await this.blogService.replaceBlog(blogId, blog);
  }

  /**
   * Responds to a PATCH to "/blogs/:blogId"
   * @param blogId The ID of the Blog we want to modify.
   * @param blog The Partial Blog object with fields filled that we want to modify.
   * @returns The modified Blog.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing blog." })
  @ApiBody({ type: UpdateBlogDto })
  @ApiOkResponse({ type: BlogDto, description: "Modified Blog." })
  @Patch(":blogId")
  async modifyBlog(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Body(new ZodValidationPipe(UpdateBlogSchema)) blog: UpdateBlogDto,
  ): Promise<BlogDto> {
    return await this.blogService.modifyBlog(blogId, blog);
  }

  /**
   * Responds to a DELETE to "/blogs/:blogId"
   * @param blogId The ID of the Blog we want to delete.
   * @returns Nothing.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Delete an existing blog." })
  @ApiOkResponse({ description: "Deleted Blog." })
  @Delete(":blogId")
  async deleteBlog(
    @Param("blogId", ParseIntPipe) blogId: number,
  ): Promise<void> {
    return await this.blogService.deleteBlog(blogId);
  }
}
