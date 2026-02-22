import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { ProductionDatabaseService } from "./db.production.service";
import { EventDatabaseService } from "./db.event.service";
import { BlogDatabaseService } from "./db.blog.service";

@Module({
  imports: [],
  providers: [
    DbService,
    ProductionDatabaseService,
    EventDatabaseService,
    BlogDatabaseService,
  ],
  controllers: [],
  exports: [
    DbService,
    ProductionDatabaseService,
    EventDatabaseService,
    BlogDatabaseService,
  ],
})
export class DbModule {}
