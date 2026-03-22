import { Module } from "@nestjs/common";
import { DbModule } from "../database/db.module";
import { MediaGalleryController } from "./controllers/media.gallery.controller";
import { MediaGalleryService } from "./services/media.gallery.service";
import { LoggerModule } from "src/util/logger/logger.module";

@Module({
  imports: [DbModule, LoggerModule],
  providers: [MediaGalleryService],
  controllers: [MediaGalleryController],
})
export class MediaModule {}
