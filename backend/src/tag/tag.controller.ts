import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TagService } from "./tag.service";
import {
  CreateTagDto,
  LanguageQueryDto,
  PaginationFilterDto,
  TagDto,
  TagViewDto,
  ModifyTagDto,
  FilterTagDto,
} from "../dto/dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateTagSchema,
  LanguageQuerySchema,
  PaginatedResponse,
  PaginationFilterSchema,
  ModifyTagSchema,
  FilterTagSchema,
} from "@repo/common";
import {
  ApiOkAnyOf,
  ApiOkPaginatedResponseAnyOf,
} from "../common/decorators/api.ok";
import { LanguageService } from "../util/language/language.service";

@Controller("tags")
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to GET /tags
   * @param lang is the language filter
   * @param paginationFilter is the pagination parameters.
   * @returns All TagDto objects
   */
  @ApiOperation({ summary: "Returns all Tag objects." })
  @ApiOkPaginatedResponseAnyOf(TagDto, TagViewDto)
  @Get()
  async getAllTags(
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
    @Query(new ZodValidationPipe(FilterTagSchema)) tagFilters: FilterTagDto,
  ): Promise<PaginatedResponse<TagDto | TagViewDto>> {
    return this.ls.flattenByLanguage<PaginatedResponse<TagDto | TagViewDto>>(
      await this.tagService.getAllTags(paginationFilter, tagFilters),
      lang.lang,
    );
  }

  /**
   * Responds to GET /tags/:tagId
   * @param tagId ID in the URL of the request.
   * @param lang is the Language filter
   * @returns The TagDto object with corresponding ID
   */
  @ApiOperation({ summary: "Returns the Tag with id in the URL." })
  @ApiOkAnyOf(TagDto, TagViewDto)
  @Get(":tagId")
  async getTagById(
    @Param("tagId", ParseIntPipe) tagId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<TagDto | TagViewDto> {
    return this.ls.flattenByLanguage<TagDto | TagViewDto>(
      await this.tagService.getTagById(tagId),
      lang.lang,
    );
  }

  /**
   * Responds to a POST to "/tags".
   * @param createTag The new TagDto data we want to add
   * @returns The newly created TagDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new Tag." })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagDto, description: "Tag Created." })
  @Post()
  async createTag(
    @Body(new ZodValidationPipe(CreateTagSchema)) createTag: CreateTagDto,
  ): Promise<TagDto> {
    return await this.tagService.createTag(createTag);
  }

  /**
   * Responds to a PATCH to "/tags/:tagId".
   * @param tagId The ID in the URL.
   * @param modifyTag The parsed ModifyTagDto object.
   * @returns The newly updated TagDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing Tag." })
  @ApiBody({ type: ModifyTagDto })
  @ApiOkResponse({ type: TagDto, description: "Tag Modified." })
  @Patch(":tagId")
  async modifyTag(
    @Param("tagId", ParseIntPipe) tagId: number,
    @Body(new ZodValidationPipe(ModifyTagSchema)) modifyTag: ModifyTagDto,
  ): Promise<TagDto> {
    return await this.tagService.modifyTag(tagId, modifyTag);
  }

  /**
   * Responds to a DELETE to "/tags/:tagId".
   * @param tagId The ID in the URL.
   * @returns Nothing.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes a Tag." })
  @ApiOkResponse({ description: "Tag Deleted." })
  @Delete(":tagId")
  async deleteTag(
    @Param("tagId", ParseIntPipe) tagId: number,
  ): Promise<{ message: string }> {
    return await this.tagService.deleteTag(tagId);
  }
}
