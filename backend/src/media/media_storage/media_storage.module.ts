import { Module } from "@nestjs/common";
import { MediaStorageService } from "./service/media_storage.service";
import { MediaStorageController } from "./media_storage.controller";
import { DbModule } from "../../database/db.module";

@Module({
  imports: [DbModule], // need this for ApiKeyDBService.
  providers: [MediaStorageService],
  controllers: [MediaStorageController],
  exports: [MediaStorageService],
})
export class MediaStorageModule {}
