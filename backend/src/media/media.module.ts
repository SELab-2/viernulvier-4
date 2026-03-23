import { Module } from "@nestjs/common";
import { DbModule } from "../database/db.module";
import { MediaGalleryController } from "./controllers/media.gallery.controller";
import { MediaGalleryService } from "./services/media.gallery.service";
import { LoggerModule } from "../util/logger/logger.module";
import { MediaItemService } from "./services/media.item.service";
import { MediaItemController } from "./controllers/media.item.controller";
import { LanguageModule } from "../util/language/LanguageModule";

@Module({
  imports: [DbModule, LoggerModule, LanguageModule],
  providers: [MediaGalleryService, MediaItemService],
  controllers: [MediaGalleryController, MediaItemController],
})
export class MediaModule {}
