import { Module } from "@nestjs/common";
import { ProductionsService } from "./productions.service";
import { ProductionsController } from "./productions.controller";
import { ProductionDatabaseService } from "src/database/db.production.service";
import { DbModule } from "../database/db.module";

@Module({
  providers: [ProductionsService],
  controllers: [ProductionsController],
  imports: [DbModule],
})
export class ProductionsModule {}
