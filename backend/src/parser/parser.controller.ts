import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { CsvInjectionService } from "../util/scraper/csv-injection.service";
import { ApiOkResponse, ApiOperation, ApiSecurity} from "@nestjs/swagger";
import { ApiKeyGuard } from "src/auth/authGuard";

@Controller("parser")
export class ParserController {
  constructor(private readonly csvInjectionService: CsvInjectionService) {}

  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject productions from CSV file" })
  @ApiOkResponse({ description: "Productions CSV injected successfully" })
  @Post("productions")
  async injectProductions(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectProductionsCSV(filePath);
  }

  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject events from CSV file" })
  @ApiOkResponse({ description: "Events CSV injected successfully" })
  @Post("events")
  async injectEvents(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectEventsCSV(filePath);
  }

  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject tags from CSV file" })
  @ApiOkResponse({ description: "Tags CSV injected successfully" })
  @Post("tags")
  async injectTags(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectTagsCSV(filePath);
  }

  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject blogs from CSV file" })
  @ApiOkResponse({ description: "Blogs CSV injected successfully" })
  @Post("blogs")
  async injectBlogs(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectBlogsCSV(filePath);
  }

  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject prices from CSV file" })
  @ApiOkResponse({ description: "Prices CSV injected successfully" })
  @Post("prices")
  async injectPrices(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectPricesCSV(filePath);
  }
}
