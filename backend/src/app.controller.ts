import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import type { HelloWorld } from "@repo/common";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): HelloWorld {
    return this.appService.getHello();
  }
}
