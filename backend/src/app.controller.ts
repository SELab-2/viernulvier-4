import { Controller, Get, Redirect } from "@nestjs/common";
import { AppService } from "./app.service";

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
}
