import { Controller, Get, Redirect } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  @Redirect()
  redirectToDocs() {
    const isProduction = process.env.NODE_ENV === "production";
    return { url: isProduction ? "/api/docs" : "/docs", statusCode: 301 };
  }

  root(): void {}
}
