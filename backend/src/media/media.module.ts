import { Module } from "@nestjs/common";
import { DbModule } from "../database/db.module";
import { MediaGalleryController } from "./controllers/media.gallery.controller";
import { MediaGalleryService } from "./services/media.gallery.service";
import { LoggerModule } from "../util/logger/logger.module";
import { MediaItemService } from "./services/media.item.service";
import { MediaItemController } from "./controllers/media.item.controller";
import { LanguageModule } from "../util/language/LanguageModule";
import { MediaCropService } from "./services/media.crop.service";
import { MediaCropController } from "./controllers/media.crop.controller";

@Module({
  imports: [DbModule, LoggerModule, LanguageModule],
  providers: [MediaGalleryService, MediaItemService, MediaCropService],
  controllers: [
    MediaGalleryController,
    MediaItemController,
    MediaCropController,
  ],
})
export class MediaModule {}
