import { Module } from "@nestjs/common";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { DbModule } from "../database/db.module";
import { LoggerModule } from "../util/logger/logger.module";
import { LanguageModule } from "../util/language/LanguageModule";

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  imports: [DbModule, LoggerModule, LanguageModule],
})
export class BlogModule {}
