import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TagService } from './tag.service';
import type { CreateTag, UpdateTag } from '@repo/common';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTag: CreateTag) {
    return this.tagService.create(createTag);
  }

  @Get('production/:productionId')
  findByProduction(@Param('productionId', ParseIntPipe) productionId: number) {
    return this.tagService.findAllByProduction(productionId);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tagService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTag: UpdateTag) {
    return this.tagService.update(id, updateTag);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
