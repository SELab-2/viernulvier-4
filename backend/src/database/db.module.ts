import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { ProductionDatabaseService } from "./db.production.service";
import { EventDatabaseService } from "./db.event.service";
import { BlogDatabaseService } from "./db.blog.service";
import { TagDatabaseService } from "./db.tag.service";
import { LocationDatabaseService } from "./db.location.service";
import { ApiKeyDatabaseService } from "./db.apiKey.service";
import { AccountDatabaseService } from "./db.account.service";
import { PriceDatabaseService } from "./db.price.service";
import { PrintItemDatabaseService } from "./db.print_item.service";
import { MediaGalleryDatabaseService } from "./media/db.media_gallery.service";
import { MediaItemDatabaseService } from "./media/db.media_item.service";
import { MediaCropDatabaseService } from "./media/db.media_crop.service";

@Module({
  imports: [],
  providers: [
    DbService,
    TagDatabaseService,
    ProductionDatabaseService,
    EventDatabaseService,
    BlogDatabaseService,
    TagDatabaseService,
    LocationDatabaseService,
    PriceDatabaseService,
    ApiKeyDatabaseService,
    AccountDatabaseService,
    MediaGalleryDatabaseService,
    MediaItemDatabaseService,
    MediaCropDatabaseService,
    PrintItemDatabaseService,
  ],
  controllers: [],
  exports: [
    DbService,
    TagDatabaseService,
    ProductionDatabaseService,
    EventDatabaseService,
    BlogDatabaseService,
    TagDatabaseService,
    LocationDatabaseService,
    PriceDatabaseService,
    ApiKeyDatabaseService,
    AccountDatabaseService,
    MediaGalleryDatabaseService,
    MediaItemDatabaseService,
    MediaCropDatabaseService,
    PrintItemDatabaseService,
  ],
})
export class DbModule {}
