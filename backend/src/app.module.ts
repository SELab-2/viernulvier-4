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
import { UtilModule } from "./util/util.module";
import { ScheduleModule } from "@nestjs/schedule";
import { MediaModule } from "./media/media.module";
import { RouterModule } from "@nestjs/core";

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
    UtilModule,
    MediaModule,

    // This allows all controllers in the MediaModule to use same base name
    RouterModule.register([
      {
        path: "media",
        module: MediaModule,
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
