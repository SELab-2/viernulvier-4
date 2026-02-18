import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { ProductionDatabaseService } from "./production.service";
import { EventDatabaseService } from "./event.service";

@Module({
  imports: [],
  providers: [DbService, ProductionDatabaseService, EventDatabaseService],
  controllers: [],
  exports: [ProductionDatabaseService, EventDatabaseService],
})
export class DbModule {}
