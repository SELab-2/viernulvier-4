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
import { LoggerModule } from "./util/logger/logger.module";
import { LanguageModule } from "./util/language/LanguageModule";
import { ScraperModule } from "./util/scraper/scraper.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
    }),
    ProductionModule,
    EventModule,
    TagModule,
    BlogModule,
    LocationModule,
    PriceModule,
    AuthModule,
    LoggerModule,
    LanguageModule,
    ScraperModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
