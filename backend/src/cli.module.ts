import { Module } from "@nestjs/common";
import { UtilsDbConnection } from "./util/scraper/database/db.connection";
import { ResetDbCommand } from "./util/scraper/reset-db.command";
import { ConfigModule } from "@nestjs/config";
import { AppLogger } from "./util/logger/logger.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
    }),
  ],
  providers: [UtilsDbConnection, ResetDbCommand, AppLogger],
})
export class CliModule {}
