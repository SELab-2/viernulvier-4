import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { TagService } from "./tag.service";
import { CreateTagDto, TagDto, UpdateTagDto } from "../dto/dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";
import { ZodValidationPipe } from "nestjs-zod";
import { CreateTagSchema, UpdateTagSchema } from "@repo/common";
import { ResourceGoneException } from "../common/exceptions";

@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * Responds to GET /tags
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
   * Responds to GET /tags/:tagId
   * @param tagId ID in the URL of the request.
   * @returns The TagDto object with corresponding ID
   */
  @ApiOperation({ summary: "Returns the Tag with id in the URL." })
  @ApiOkResponse({ type: TagDto, description: "Tag Found." })
  @Get(":tagId")
  async getTagById(
    @Param("tagId", ParseIntPipe) tagId: number,
  ): Promise<TagDto> {
    const tag = await this.tagService.getTagById(tagId);
    if (!tag) {
      throw new ResourceGoneException(`Tag ${tagId} not found.`);
    }
    return tag;
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
   * @param updateTag The parsed UpdateTagDto object.
   * @returns The newly updated TagDto.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Modifies an existing Tag." })
  @ApiBody({ type: UpdateTagDto })
  @ApiOkResponse({ type: TagDto, description: "Tag Modified." })
  @Patch(":tagId")
  async updateTag(
    @Param("tagId", ParseIntPipe) tagId: number,
    @Body(new ZodValidationPipe(UpdateTagSchema)) updateTag: UpdateTagDto,
  ): Promise<TagDto> {
    const updated = await this.tagService.updateTag(tagId, updateTag);
    if (!updated) {
      throw new ResourceGoneException(`Cannot update: Tag ${tagId} does not exist`);
    }
    return updated;
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
    const tag = await this.tagService.getTagById(tagId);
    if (!tag) {
      throw new ResourceGoneException(`Cannot delete: Tag ${tagId} does not exist`);
    }
    return await this.tagService.deleteTag(tagId);
  }
}
