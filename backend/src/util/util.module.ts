import { Module } from "@nestjs/common";
import { ScraperService } from "./scraper/scraper.service";
import { AppLogger } from "./logger/logger.service";
import { LanguageService } from "./language/language.service";

@Module({
  providers: [ScraperService, AppLogger, LanguageService],
  exports: [AppLogger, LanguageService],
})
export class UtilModule {}
