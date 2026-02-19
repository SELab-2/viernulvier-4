import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { EventDatabaseService } from "src/database/db.event.service";

@Module({
  providers: [EventsService],
  controllers: [EventsController],
  imports: [EventDatabaseService],
})
export class EventsModule {}
