import { Module } from "@nestjs/common";
import { LanguageService } from "./language.service";
import { LoggerModule } from "../logger/logger.module";

@Module({
  providers: [LanguageService],
  exports: [LanguageService],
  imports: [LoggerModule],
})
export class LanguageModule {}
