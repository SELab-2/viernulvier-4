import { Module } from "@nestjs/common";
import { ScraperService } from "./scraper.service";
import { ScraperEngine } from "./scraper";
import { ScraperRunner } from "./main";
import { LanguageModule } from "../language/LanguageModule";
import { LoggerModule } from "../logger/logger.module";
import { ScraperDbModule } from "./database/scraper.db.module";
import { CsvInjectionService } from "./csv-injection.service";
import { MediaStorageModule } from "../../media/media_storage/media_storage.module";

@Module({
  providers: [
    ScraperService,
    ScraperEngine,
    ScraperRunner,
    CsvInjectionService,
  ],
  exports: [ScraperEngine, ScraperRunner, ScraperService],
  imports: [LanguageModule, LoggerModule, ScraperDbModule, MediaStorageModule],
})
export class ScraperModule {}
