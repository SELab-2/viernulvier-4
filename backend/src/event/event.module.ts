import { Module } from "@nestjs/common";
import EventService from "./event.service";
import { EventController } from "./controllers/event.controller";
import { DbModule } from "../database/db.module";
import { EventLocationController } from "./controllers/event-location.controller";

@Module({
  providers: [EventService],
  controllers: [EventController, EventLocationController],
  imports: [DbModule],
})
export class EventModule {}
