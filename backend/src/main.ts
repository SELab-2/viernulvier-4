import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import logger from "./util/logger/logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // server -> no touchy ----------------------- //
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    app.setGlobalPrefix("api");
  }
  const swaggerPath = isProduction ? "api/docs" : "docs";
  //------------------------------------//

  app.enableCors({
    origin: "http://localhost:3001", // Frontend DEV
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("VierNulVier Archive API")
    .setDescription("Documentation for the VierNulVier Archive API.")
    .setVersion("0.1")
    .addSecurity("apiKey", {
      type: "apiKey",
      name: "x-api-key", // header name
      in: "header", // could also be "query" if you want
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, documentFactory, {
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js",
    ],
  });

  await app.listen(process.env.PORT ?? 3000);
  logger.info(`Server is running on port ${process.env.PORT ?? 3000}`);
}

void bootstrap();
