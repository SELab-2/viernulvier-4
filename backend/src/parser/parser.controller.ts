import { Controller, Post, Body } from "@nestjs/common";
import { CsvInjectionService } from "../util/scraper/csv-injection.service";

@Controller("parser")
export class ParserController {
  constructor(private readonly csvInjectionService: CsvInjectionService) {}

  @Post("productions")
  async injectProductions(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectProductionsCSV(filePath);
  }

  @Post("events")
  async injectEvents(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectEventsCSV(filePath);
  }

  @Post("tags")
  async injectTags(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectTagsCSV(filePath);
  }

  @Post("blogs")
  async injectBlogs(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectBlogsCSV(filePath);
  }

  @Post("prices")
  async injectPrices(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectPricesCSV(filePath);
  }
}
