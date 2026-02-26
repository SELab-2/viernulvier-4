import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProductionModule } from "./production/production.module";
import { EventModule } from "./event/event.module";
import { ConfigModule } from "@nestjs/config";
import { TagModule } from "./tag/tag.module";
import { BlogModule } from "./blog/blog.module";

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
