import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env", // Make sure .env is inside of root of project.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
