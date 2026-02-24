import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { ProductionDatabaseService } from "./db.production.service";
import { EventDatabaseService } from "./db.event.service";
import { BlogDatabaseService } from "./db.blog.service";
import { TagDatabaseService } from "./db.tag.service";

@Module({
  imports: [],
  providers: [
    DbService,
    ProductionDatabaseService,
    EventDatabaseService,
    BlogDatabaseService,
    TagDatabaseService,
  ],
  controllers: [],
  exports: [
    ProductionDatabaseService,
    EventDatabaseService,
    BlogDatabaseService,
    TagDatabaseService,
  ],
})
export class DbModule {}
