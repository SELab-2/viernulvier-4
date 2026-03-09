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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
})
export class AppModule {}
