import { Module } from "@nestjs/common";
import { ProductionService } from "./production.service";
import { ProductionController } from "./controllers/production.controller";
import { DbModule } from "../database/db.module";
import { ProductionBlogController } from "./controllers/production-blog.controller";
import { ProductionTagController } from "./controllers/production-tag.controller";
import { LanguageModule } from "../util/language/LanguageModule";
import { LoggerModule } from "../util/logger/logger.module";
import { ProductionMediaController } from "./controllers/production-media.controller";

@Module({
  providers: [ProductionService],
  controllers: [
    ProductionController,
    ProductionBlogController,
    ProductionTagController,
    ProductionMediaController,
  ],
  imports: [DbModule, LanguageModule, LoggerModule],
})
export class ProductionModule {}
