import { Module } from "@nestjs/common";
import { PriceService } from "./price.service";
import { PriceController } from "./price.controller";
import { DbModule } from "../database/db.module";
import { UtilModule } from "../util/util.module";

@Module({
  providers: [PriceService],
  controllers: [PriceController],
  imports: [DbModule, UtilModule],
})
export class PriceModule {}
