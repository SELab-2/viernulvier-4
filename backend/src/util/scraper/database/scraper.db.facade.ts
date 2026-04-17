import { Injectable } from "@nestjs/common";
import { ScraperProductionDbService } from "./scraper.production.db.service";
import { ScraperEventDbService } from "./scraper.event.db.service";
import { ScraperAttributesDbService } from "./scraper.attributes.db.service";
import { ScraperBlogDbService } from "./scraper.blog.db.service";
import { ScraperMediaDbService } from "./scraper.media.db.service";

@Injectable()
export class ScraperDbManager {
  constructor(
    public readonly production: ScraperProductionDbService,
    public readonly event: ScraperEventDbService,
    public readonly taxonomies: ScraperAttributesDbService,
    public readonly blog: ScraperBlogDbService,
    public readonly media: ScraperMediaDbService,
  ) {}
}
