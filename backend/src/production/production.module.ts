import { Module } from "@nestjs/common";
import { ProductionService } from "./production.service";
import { ProductionController } from "./production.controller";

@Module({
  providers: [ProductionService],
  controllers: [ProductionController],
})
export class ProductionModule {}
