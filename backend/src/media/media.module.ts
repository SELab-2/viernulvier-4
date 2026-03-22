import { Module } from "@nestjs/common";
import { DbModule } from "../database/db.module";
import { UtilModule } from "../util/util.module";
import { MediaGalleryController } from "./controllers/media.gallery.controller";
import { MediaGalleryService } from "./services/media.gallery.service";

@Module({
  imports: [DbModule, UtilModule],
  providers: [MediaGalleryService],
  controllers: [MediaGalleryController],
})
export class MediaModule {}
