import { Module } from "@nestjs/common";
import { ScraperService } from "./scraper.service";
import { ScraperEngine } from "./scraper.engine";
import { ScraperRunner } from "./scraper.runner";
import { LanguageModule } from "../language/LanguageModule";
import { LoggerModule } from "../logger/logger.module";
import { ScraperDbModule } from "./database/scraper.db.module";
import { MediaStorageModule } from "../../media/media_storage/media_storage.module";
import { CsvInjectionService } from "./csv/csv-injection.service";

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
