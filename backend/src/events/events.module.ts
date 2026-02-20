import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { EventDatabaseService } from "src/database/db.event.service";
import { DbModule } from "../database/db.module";

@Module({
  providers: [EventsService],
  controllers: [EventsController],
  imports: [DbModule],
})
export class EventsModule {}
