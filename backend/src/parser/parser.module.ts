import { Module } from "@nestjs/common";
import { ParserController } from "./parser.controller";
import { ScraperModule } from "../util/scraper/scraper.module";

@Module({
  controllers: [ParserController],
  imports: [ScraperModule],
})
export class ParserModule {}
