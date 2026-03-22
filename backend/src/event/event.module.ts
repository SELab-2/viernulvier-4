import { Module } from "@nestjs/common";
import EventService from "./event.service";
import { EventController } from "./controllers/event.controller";
import { DbModule } from "../database/db.module";
import { EventLocationController } from "./controllers/event-location.controller";
import { EventPriceController } from "./controllers/event-price.controller";
import { LoggerModule } from "../util/logger/logger.module";
import { LanguageModule } from "../util/language/LanguageModule";

@Module({
  providers: [EventService],
  controllers: [EventController, EventLocationController, EventPriceController],
  imports: [DbModule, LoggerModule, LanguageModule],
})
export class EventModule {}
