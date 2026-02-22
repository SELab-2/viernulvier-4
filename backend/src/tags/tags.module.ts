import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { DbModule } from '../database/db.module';

@Module({
  imports: [DbModule],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
