import { Module } from "@nestjs/common";
import { EventService } from "./events.service";
import { EventController } from "./events.controller";
import { EventDatabaseService } from "src/database/db.event.service";
import { DbModule } from "../database/db.module";

@Module({
  providers: [EventService],
  controllers: [EventController],
  imports: [DbModule],
})
export class EventModule {}
