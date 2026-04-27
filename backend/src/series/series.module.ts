import { Module } from "@nestjs/common";
import { SeriesService } from "./series.service";
import { SeriesController } from "./series.controller";

@Module({
  providers: [SeriesService],
  controllers: [SeriesController],
})
export class SeriesModule {}
