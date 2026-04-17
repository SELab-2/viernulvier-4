import { Injectable } from "@nestjs/common";
import { ScraperProductionDbService } from "./scraper.production.db.service";
import { ScraperEventDbService } from "./scraper.event.db.service";
import { ScraperAttributesDbService } from "./scraper.attributes.db.service";
import { ScraperBlogDbService } from "./scraper.blog.db.service";
import { ScraperMediaDbService } from "./scraper.media.db.service";

/**
 * The Manager is an object that acts as an entry point for all the other services.
 * It allows you to only import this object and reach all the others through this.
 * Main purpose is to simplify imports elsewhere.
 */
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
