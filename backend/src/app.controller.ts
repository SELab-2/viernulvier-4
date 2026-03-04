import { Controller, Get, Redirect } from "@nestjs/common";
import { AppService } from "./app.service";
import { TeapotException } from "./common/exceptions";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect("/docs", 301)
  root(): void {}

  // Easter egg 418
  @Get("coffee")
  makeCoffee() {
    throw new TeapotException();
  }
}
