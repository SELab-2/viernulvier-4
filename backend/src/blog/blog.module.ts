import { Module } from "@nestjs/common";
import { BlogController } from "./controllers/blog.controller";
import { BlogService } from "./blog.service";
import { DbModule } from "../database/db.module";
import { LoggerModule } from "../util/logger/logger.module";
import { LanguageModule } from "../util/language/LanguageModule";
import { BlogMediaController } from "./controllers/blog-media.controller";

@Module({
  controllers: [BlogController, BlogMediaController],
  providers: [BlogService],
  imports: [DbModule, LoggerModule, LanguageModule],
})
export class BlogModule {}
