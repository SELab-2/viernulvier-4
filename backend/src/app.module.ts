import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProductionModule } from "./production/production.module";
import { EventModule } from "./event/event.module";
import { ConfigModule } from "@nestjs/config";
import { BlogModule } from './blog/blog.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
    }),
    ProductionModule,
    EventModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
