import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProductionsModule } from "./productions/productions.module";
import { EventsModule } from "./events/events.module";

@Module({
  imports: [ProductionsModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
