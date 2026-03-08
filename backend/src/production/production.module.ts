import { Module } from "@nestjs/common";
import { ProductionService } from "./production.service";
import { ProductionController } from "./controllers/production.controller";
import { DbModule } from "../database/db.module";
import { ProductionBlogController } from "./controllers/production-blog.controller";
import { ProductionTagController } from "./controllers/production-tag.controller";

@Module({
  providers: [ProductionService],
  controllers: [
    ProductionController,
    ProductionBlogController,
    ProductionTagController,
  ],
  imports: [DbModule],
})
export class ProductionModule {}
