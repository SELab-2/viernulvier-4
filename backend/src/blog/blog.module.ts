import { Module } from "@nestjs/common";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { DbModule } from "../database/db.module";

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  imports: [DbModule],
})
export class BlogModule {}
