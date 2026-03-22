import { Module } from "@nestjs/common";
import { ScraperService } from "./scraper.service";
import { ScraperEngine } from "./scraper";
import { ScraperRunner } from "./main";
import { LanguageModule } from "../language/LanguageModule";
import { LoggerModule } from "../logger/logger.module";
import { ScraperDbModule } from "./database/scraper.db.module";

@Module({
  providers: [ScraperService, ScraperEngine, ScraperRunner],
  exports: [ScraperEngine, ScraperRunner, ScraperService],
  imports: [LanguageModule, LoggerModule, ScraperDbModule],
})
export class ScraperModule {}
