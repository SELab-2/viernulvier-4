import { Module } from "@nestjs/common";
import { ProductionsService } from "./productions.service";
import { ProductionsController } from "./productions.controller";
import { ProductionDatabaseService } from "src/database/db.production.service";

@Module({
  providers: [ProductionsService],
  controllers: [ProductionsController],
  imports: [ProductionDatabaseService],
})
export class ProductionsModule {}
