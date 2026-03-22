import { Module } from "@nestjs/common";
import { UtilsDbConnection } from "./db.connection";

@Module({
  providers: [UtilsDbConnection],
  exports: [UtilsDbConnection],
})
export class ScraperDbModule {}
