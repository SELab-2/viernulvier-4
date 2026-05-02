import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ProductionModule } from "./production/production.module";
import { EventModule } from "./event/event.module";
import { ConfigModule } from "@nestjs/config";
import { TagModule } from "./tag/tag.module";
import { BlogModule } from "./blog/blog.module";
import { LocationModule } from "./location/location.module";
import { AuthModule } from "./auth/auth.module";
import { PriceModule } from "./price/price.module";
import { ScheduleModule } from "@nestjs/schedule";
import { MediaModule } from "./media/media.module";
import { RouterModule } from "@nestjs/core";
import { LoggerModule } from "./util/logger/logger.module";
import { LanguageModule } from "./util/language/LanguageModule";
import { ScraperModule } from "./util/scraper/scraper.module";
import { ParserModule } from "./parser/parser.module";
import { PrintItemModule } from "./print/print_item.module";
import { SeriesModule } from "./series/series.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
    }),
    SeriesModule,
    ProductionModule,
    EventModule,
    TagModule,
    BlogModule,
    LocationModule,
    PriceModule,
    AuthModule,
    MediaModule,
    PrintItemModule,

    // This allows all controllers in the MediaModule to use same base name
    RouterModule.register([
      {
        path: "media",
        module: MediaModule,
      },
    ]),
    LoggerModule,
    LanguageModule,
    ScraperModule,
    ParserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
