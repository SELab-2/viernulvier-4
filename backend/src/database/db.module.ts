import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { ProductionDatabaseService } from "./db.production.service";
import { EventDatabaseService } from "./db.event.service";

@Module({
  imports: [],
  providers: [DbService, ProductionDatabaseService, EventDatabaseService],
  controllers: [],
  exports: [ProductionDatabaseService, EventDatabaseService],
})
export class DbModule {}
