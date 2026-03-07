import { Module } from "@nestjs/common";
import { PriceService } from "./price.service";
import { PriceController } from "./price.controller";
import { DbModule } from "../database/db.module";

@Module({
  providers: [PriceService],
  controllers: [PriceController],
  imports: [DbModule],
})
export class PriceModule {}
