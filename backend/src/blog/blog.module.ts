import { Module } from "@nestjs/common";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { DbModule } from "../database/db.module";
import { UtilModule } from "../util/util.module";

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  imports: [DbModule, UtilModule],
})
export class BlogModule {}
