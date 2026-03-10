import { Module } from "@nestjs/common";
import { TagService } from "./tag.service";
import { TagController } from "./tag.controller";
import { DbModule } from "../database/db.module";
import { UtilModule } from "src/util/util.module";

@Module({
  imports: [DbModule, UtilModule],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
