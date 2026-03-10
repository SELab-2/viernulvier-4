import { Controller, Get, Redirect } from "@nestjs/common";
import { AppService } from "./app.service";
import { TeapotException } from "./common/exceptions";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect()
  redirectToDocs() {
    const isProduction = process.env.NODE_ENV === "production";
    return { url: isProduction ? "/api/docs" : "/docs", statusCode: 301 };
  }

  root(): void {}

  // Easter egg 418
  @Get("coffee")
  makeCoffee() {
    throw new TeapotException();
  }
}
