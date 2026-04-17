import { Module } from "@nestjs/common";
import { ScraperDbService } from "./scraper.db.service";
import { ScraperProductionDbService } from "./scraper.production.db.service";
import { ScraperEventDbService } from "./scraper.event.db.service";
import { ScraperMediaDbService } from "./scraper.media.db.service";
import { ScraperAttributesDbService } from "./scraper.attributes.db.service";
import { ScraperBlogDbService } from "./scraper.blog.db.service";
import { ScraperDbManager } from "./scraper.db.facade";

@Module({
  providers: [
    ScraperDbService,
    ScraperProductionDbService,
    ScraperEventDbService,
    ScraperMediaDbService,
    ScraperAttributesDbService,
    ScraperBlogDbService,
    ScraperDbManager,
  ],
  exports: [
    ScraperDbService,
    ScraperProductionDbService,
    ScraperEventDbService,
    ScraperAttributesDbService,
    ScraperMediaDbService,
    ScraperBlogDbService,
    ScraperDbManager,
  ],
})
export class ScraperDbModule {}
