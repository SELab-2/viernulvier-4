import { Module } from "@nestjs/common";
import { TagService } from "./tag.service";
import { TagController } from "./tag.controller";
import { DbModule } from "../database/db.module";
import { LanguageModule } from "../util/language/LanguageModule";
import { LoggerModule } from "../util/logger/logger.module";

@Module({
  imports: [DbModule, LanguageModule, LoggerModule],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
