import { Module } from "@nestjs/common";
import { ProductionService } from "./production.service";
import { ProductionController } from "./production.controller";
import { DbModule } from "../database/db.module";
import { ProductionBlogController } from "./production-blog.controller";
import { ProductionTagController } from "./production-tag.controller";

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
