import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { ProductionDatabaseService } from "./db.production.service";
import { EventDatabaseService } from "./db.event.service";
import { BlogDatabaseService } from "./db.blog.service";
import { TagDatabaseService } from "./db.tag.service";
import { AccountDatabaseService } from "./db.account.service";

@Module({
  imports: [],
  providers: [
    DbService,
    TagDatabaseService,
    ProductionDatabaseService,
    EventDatabaseService,
    BlogDatabaseService,
    TagDatabaseService,
    AccountDatabaseService,
  ],
  controllers: [],
  exports: [
    DbService,
    TagDatabaseService,
    ProductionDatabaseService,
    EventDatabaseService,
    BlogDatabaseService,
    TagDatabaseService,
    AccountDatabaseService,
  ],
})
export class DbModule {}
