import { Module } from "@nestjs/common";
import { TagService } from "./tag.service";
import { TagController } from "./tag.controller";
import { DbModule } from "../database/db.module";

@Module({
  imports: [DbModule],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
