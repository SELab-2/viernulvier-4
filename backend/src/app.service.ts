import { Injectable } from "@nestjs/common";
import { HelloWorld, HelloWorldSchema } from "@repo/common";

@Injectable()
export class AppService {
  getHello(): HelloWorld {
    // Meestal zouden we hier dan een databank-object omzetten om mee te werken.
    return HelloWorldSchema.parse({
      text: "Hello World!",
    });
  }
}
