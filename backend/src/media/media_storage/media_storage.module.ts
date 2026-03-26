import { Module } from "@nestjs/common";
import { MediaStorageService } from "./media_storage.service";

@Module({
  providers: [MediaStorageService],
  controllers: [],
  exports: [MediaStorageService],
})
export class MediaStorageModule {}
