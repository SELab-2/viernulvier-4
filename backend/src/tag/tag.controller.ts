import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto, UpdateTagDto, TagDto } from '../dto/dto';
import { ApiOperation, ApiBody, ApiOkResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * Maakt een nieuwe tag aan in de database.
   * @param createTag De data voor de nieuwe tag.
   * @returns De aangemaakte TagDto.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new tag', description: 'Adds a new tag category to the system.' })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagDto, description: "The tag has been successfully created" })
  createTag(@Body() createTag: CreateTagDto) {
    return this.tagService.createTag(createTag);
  }

  /**
   * Haalt één specifieke tag op basis van het ID.
   * @param id Het unieke ID van de tag.
   * @returns De gevonden TagDto.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single tag by ID', description: 'Fetches detailed information about a specific tag.' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the tag', type: Number })
  @ApiOkResponse({ type: TagDto, description: "Returns the requested tag" })
  findTagById(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.findTagById(id);
  }

  /**
   * Haalt een lijst op van alle beschikbare tags.
   * @returns Een array van TagDto's.
   */
  @Get()
  @ApiOperation({ summary: 'Get all tags', description: 'Retrieves a list of all tags currently in the database.' })
  @ApiOkResponse({ type: [TagDto], description: "Returns all tags" })
  findAllTags() {
    return this.tagService.findAllTags();
  }

  /**
   * Werkt een bestaande tag bij.
   * @param id Het ID van de tag die gewijzigd moet worden.
   * @param updateTag De nieuwe data voor de tag.
   * @returns De bijgewerkte TagDto.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing tag', description: 'Modifies the properties of an existing tag.' })
  @ApiParam({ name: 'id', description: 'The ID of the tag to update', type: Number })
  @ApiBody({ type: UpdateTagDto })
  @ApiOkResponse({ type: TagDto, description: "The tag has been successfully updated" })
  updateTag(@Param('id', ParseIntPipe) id: number, @Body() updateTag: UpdateTagDto) {
    return this.tagService.updateTag(id, updateTag);
  }

  /**
   * Verwijdert een tag uit het systeem.
   * @param id Het ID van de tag die verwijderd moet worden.
   * @returns Een succesmelding.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag by ID', description: 'Permanently removes a tag from the database.' })
  @ApiParam({ name: 'id', description: 'The ID of the tag to delete', type: Number })
  @ApiOkResponse({ description: "Success message confirming deletion" })
  deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.deleteTag(id);
  }
}