import { Module } from "@nestjs/common";
import { ProductionService } from "./production.service";
import { ProductionController } from "./production.controller";
import { DbModule } from "../database/db.module";

@Module({
  providers: [ProductionService],
  controllers: [ProductionController],
  imports: [DbModule],
})
export class ProductionModule {}
