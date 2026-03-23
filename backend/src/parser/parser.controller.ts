import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { CsvInjectionService } from "../util/scraper/csv-injection.service";
import { ApiOkResponse, ApiOperation, ApiSecurity } from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";

@Controller("parser")
export class ParserController {
  constructor(private readonly csvInjectionService: CsvInjectionService) {}

  /**
   * Responds to a POST to "/parser/productions" with a file path in the body,
   * and injects productions from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for productions.
   * @param filePath The path to the CSV file containing production data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject productions from CSV file" })
  @ApiOkResponse({ description: "Productions CSV injected successfully" })
  @Post("productions")
  async injectProductions(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectProductionsCSV(filePath);
  }

  /**
   * Responds to a POST to "/parser/events" with a file path in the body,
   * and injects events from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for events.
   * @param filePath The path to the CSV file containing event data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject events from CSV file" })
  @ApiOkResponse({ description: "Events CSV injected successfully" })
  @Post("events")
  async injectEvents(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectEventsCSV(filePath);
  }

  /**
   * Responds to a POST to "/parser/tags" with a file path in the body,
   * and injects tags from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for tags.
   * @param filePath The path to the CSV file containing tag data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject tags from CSV file" })
  @ApiOkResponse({ description: "Tags CSV injected successfully" })
  @Post("tags")
  async injectTags(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectTagsCSV(filePath);
  }

  /**
   * Responds to a POST to "/parser/blogs" with a file path in the body,
   * and injects blogs from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for blogs.
   * @param filePath The path to the CSV file containing blog data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject blogs from CSV file" })
  @ApiOkResponse({ description: "Blogs CSV injected successfully" })
  @Post("blogs")
  async injectBlogs(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectBlogsCSV(filePath);
  }

  /**
   * Responds to a POST to "/parser/prices" with a file path in the body,
   * and injects prices from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for prices.
   * @param filePath The path to the CSV file containing price data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject prices from CSV file" })
  @ApiOkResponse({ description: "Prices CSV injected successfully" })
  @Post("prices")
  async injectPrices(@Body("filePath") filePath: string) {
    return this.csvInjectionService.injectPricesCSV(filePath);
  }
}
