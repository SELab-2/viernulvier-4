import { Controller, Get, Redirect } from "@nestjs/common";
import { TeapotException } from "./common/exceptions";
import { ConfigService } from "@nestjs/config";

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Redirect()
  redirectToDocs() {
    const isProduction =
      this.configService.get<string>("NODE_ENV") === "production";
    return { url: isProduction ? "/api/docs" : "/docs", statusCode: 301 };
  }

  root(): void {}

  // Easter egg 418
  @Get("coffee")
  makeCoffee() {
    throw new TeapotException();
  }
}
