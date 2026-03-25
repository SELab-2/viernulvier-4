import { Module } from "@nestjs/common";
import { PriceService } from "./price.service";
import { PriceController } from "./price.controller";
import { DbModule } from "../database/db.module";
import { LoggerModule } from "../util/logger/logger.module";
import { LanguageModule } from "../util/language/LanguageModule";

@Module({
  providers: [PriceService],
  controllers: [PriceController],
  imports: [DbModule, LoggerModule, LanguageModule],
})
export class PriceModule {}
