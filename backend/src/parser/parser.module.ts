import { Module } from "@nestjs/common";
import { ParserController } from "./parser.controller";
import { ScraperModule } from "../util/scraper/scraper.module";
import { DbModule } from "../database/db.module";

@Module({
  controllers: [ParserController],
  imports: [ScraperModule, DbModule],
})
export class ParserModule {}
