import { Module } from "@nestjs/common";
import { LocationService } from "./location.service";
import { LocationController } from "./location.controller";
import { DbModule } from "../database/db.module";
import { LoggerModule } from "../util/logger/logger.module";
import { LanguageModule } from "../util/language/LanguageModule";

@Module({
  providers: [LocationService],
  controllers: [LocationController],
  imports: [DbModule, LoggerModule, LanguageModule],
})
export class LocationModule {}
