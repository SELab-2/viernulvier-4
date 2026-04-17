import { Module } from "@nestjs/common";
import { UtilsDbConnection } from "./util/scraper/database/scraper.db.service";
import { ResetDbCommand } from "./util/scraper/reset-db.command";
import { ConfigModule } from "@nestjs/config";
import { AppLogger } from "./util/logger/logger.service";
import { InjectStructuredCsvTest } from "./util/scraper/csv/inject-structured-test.command";
import { InjectCsvEngine } from "./util/scraper/csv/inject-csv.engine";
import { LanguageService } from "./util/language/language.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
    }),
  ],
  providers: [
    UtilsDbConnection,
    ResetDbCommand,
    AppLogger,
    InjectStructuredCsvTest,
    InjectCsvEngine,
    LanguageService,
  ],
})
export class CliModule {}
