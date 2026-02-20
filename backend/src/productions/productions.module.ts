import { Module } from "@nestjs/common";
import { ProductionsService } from "./productions.service";
import { ProductionsController } from "./productions.controller";
import { DbModule } from "src/database/db.module";

@Module({
  providers: [ProductionsService],
  controllers: [ProductionsController],
  imports: [DbModule], // Import DB Module here so we can use it's services.
})
export class ProductionsModule {}
