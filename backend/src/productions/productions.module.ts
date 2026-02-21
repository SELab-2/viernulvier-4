import { Module } from "@nestjs/common";
import { ProductionService } from "./productions.service";
import { ProductionsController } from "./productions.controller";
import { ProductionDatabaseService } from "src/database/db.production.service";
import { DbModule } from "../database/db.module";

@Module({
  providers: [ProductionService],
  controllers: [ProductionsController],
  imports: [DbModule],
})
export class ProductionModule {}
