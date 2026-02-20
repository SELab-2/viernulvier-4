import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { DbModule } from "src/database/db.module";

@Module({
  providers: [EventsService],
  controllers: [EventsController],
  imports: [DbModule], // Import DB Service here so we can use it's services.
})
export class EventsModule {}
