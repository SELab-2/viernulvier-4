import { Module } from "@nestjs/common";
import { UtilsDbConnection } from "./scraper.db.service";
import { ScraperProductionDbService } from "./scraper.production.db.service";
import { ScraperEventDbService } from "./scraper.event.db.service";
import { ScraperMediaDbService } from "./scraper.media.db.service";
import { ScraperTaxonomiesDbService } from "./scraper.taxonomies.db.service";
import { ScraperDbBlogService } from "./scraper.db.blog.service";
import { ScraperDbFacade } from "./scraper.db.facade";

@Module({
  providers: [
    UtilsDbConnection,
    ScraperProductionDbService,
    ScraperEventDbService,
    ScraperMediaDbService,
    ScraperTaxonomiesDbService,
    ScraperDbBlogService,
    ScraperDbFacade,
  ],
  exports: [
    UtilsDbConnection,
    ScraperProductionDbService,
    ScraperEventDbService,
    ScraperTaxonomiesDbService,
    ScraperMediaDbService,
    ScraperDbBlogService,
    ScraperDbFacade,
  ],
})
export class ScraperDbModule {}
