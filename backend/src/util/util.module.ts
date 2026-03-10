import { Module } from "@nestjs/common";
import { ScraperService } from "./scraper/scraper.service";
import { AppLogger } from "./logger/logger.service";

@Module({
  providers: [ScraperService, AppLogger],
  exports: [AppLogger],
})
export class UtilModule {}
