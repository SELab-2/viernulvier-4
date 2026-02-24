import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto, UpdateTagDto, TagDto } from '../dto/dto';
import { ApiOperation, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagDto, description: "The tag has been successfully created" })
  createTag(@Body() createTag: CreateTagDto) {
    return this.tagService.createTag(createTag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tag by ID' })
  @ApiOkResponse({ type: TagDto, description: "Returns the requested tag" })
  findOneTag(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.findOneTag(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing tag' })
  @ApiBody({ type: UpdateTagDto })
  @ApiOkResponse({ type: TagDto, description: "The tag has been successfully updated" })
  updateTag(@Param('id', ParseIntPipe) id: number, @Body() updateTag: UpdateTagDto) {
    return this.tagService.updateTag(id, updateTag);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag by ID' })
  @ApiOkResponse({ description: "Success message confirming deletion" })
  deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.deleteTag(id);
  }
}
