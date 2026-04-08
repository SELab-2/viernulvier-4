import { Module } from "@nestjs/common";
import { PrintItemService } from "./print_item.service";
import { PrintItemController } from "./print_item.controller";
import { DbModule } from "../database/db.module";
import { LoggerModule } from "../util/logger/logger.module";
import { LanguageModule } from "../util/language/LanguageModule";

@Module({
  providers: [PrintItemService],
  controllers: [PrintItemController],
  imports: [DbModule, LoggerModule, LanguageModule],
})
export class PrintItemModule {}