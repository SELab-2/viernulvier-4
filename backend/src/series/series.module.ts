import { Module } from "@nestjs/common";
import { SeriesService } from "./series.service";
import { SeriesController } from "./series.controller";
import { DbModule } from "../database/db.module";
import { LanguageModule } from "../util/language/LanguageModule";

@Module({
  imports: [DbModule, LanguageModule],
  providers: [SeriesService],
  controllers: [SeriesController],
})
export class SeriesModule {}
