import { Injectable } from "@nestjs/common";
import { ScraperProductionDbService } from "./scraper.production.db.service";
import { ScraperEventDbService } from "./scraper.event.db.service";
import { ScraperTaxonomiesDbService } from "./scraper.taxonomies.db.service";
import { ScraperDbBlogService } from "./scraper.db.blog.service";
import { ScraperMediaDbService } from "./scraper.media.db.service";

@Injectable()
export class ScraperDbFacade {
  constructor(
    public readonly production: ScraperProductionDbService,
    public readonly event: ScraperEventDbService,
    public readonly taxonomies: ScraperTaxonomiesDbService,
    public readonly blog: ScraperDbBlogService,
    public readonly media: ScraperMediaDbService,
  ) {}
}
