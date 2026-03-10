import { Module } from "@nestjs/common";
import { LocationService } from "./location.service";
import { LocationController } from "./location.controller";
import { DbModule } from "../database/db.module";
import { UtilModule } from "src/util/util.module";

@Module({
  providers: [LocationService],
  controllers: [LocationController],
  imports: [DbModule, UtilModule],
})
export class LocationModule {}
