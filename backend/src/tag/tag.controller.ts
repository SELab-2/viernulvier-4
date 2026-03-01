import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { TagService } from "./tag.service";
import { CreateTagDto, UpdateTagDto, TagDto } from "../dto/dto";
import { ApiBody, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { CreateTagSchema, UpdateTagSchema } from "@repo/common";

@Controller("tag")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * Responds to GET /tag
   * @returns All TagDto objects
   */
  @ApiOperation({ summary: "Returns all Tag objects." })
  @ApiOkResponse({
    type: TagDto,
    isArray: true,
    description: "All Tags returned.",
  })
  @Get()
  async getAllTags(): Promise<TagDto[]> {
    return await this.tagService.getAllTags();
  }

  /**
   * Responds to GET /tag/:id
   * @param id ID in the URL of the request.
   * @returns The TagDto object with corresponding ID
   */
  @ApiOperation({ summary: "Returns the Tag with id in the URL." })
  @ApiOkResponse({ type: TagDto, description: "Tag Found." })
  @Get(":id")
  async getTagById(@Param("id", ParseIntPipe) id: number): Promise<TagDto> {
    return await this.tagService.getTagById(id);
  }

  /**
   * Responds to a POST to "/tag".
   * @param createTag The new TagDto data we want to add
   * @returns The newly created TagDto.
   */
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
   * Responds to a PATCH to "/tag/:id".
   * @param id The ID in the URL.
   * @param updateTag The parsed UpdateTagDto object.
   * @returns The newly updated TagDto.
   */
  @ApiOperation({ summary: "Modifies an existing Tag." })
  @ApiBody({ type: UpdateTagDto })
  @ApiOkResponse({ type: TagDto, description: "Tag Modified." })
  @Patch(":id")
  async updateTag(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateTagSchema)) updateTag: UpdateTagDto,
  ): Promise<TagDto> {
    return await this.tagService.updateTag(id, updateTag);
  }

  /**
   * Responds to a DELETE to "/tag/:id".
   * @param id The ID in the URL.
   * @returns Nothing.
   */
  @ApiOperation({ summary: "Deletes a Tag." })
  @ApiOkResponse({ description: "Tag Deleted." })
  @Delete(":id")
  async deleteTag(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.tagService.deleteTag(id);
  }
}
