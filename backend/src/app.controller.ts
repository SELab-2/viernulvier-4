import { Controller, Get, Redirect } from "@nestjs/common";
import { AppService } from "./app.service";
import type { HelloWorld } from "@repo/common";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect("/docs", 301)
  root(): void {}
}
