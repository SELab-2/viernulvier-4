import { Controller, Post, Body, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from "@nestjs/common";
import { CsvInjectionService } from "../util/scraper/csv-injection.service";
import { ApiOkResponse, ApiOperation, ApiSecurity } from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";
import { FileInterceptor } from "@nestjs/platform-express";

type UploadedCsvFile = {
  buffer: Buffer;
  mimetype?: string; // not yet used, but can be helpful for future validation if needed
};

@Controller("parser")
export class ParserController {
  constructor(private readonly csvInjectionService: CsvInjectionService) {}

  private getCsvSource(
    file?: UploadedCsvFile,
    filePath?: string,
  ): string | Buffer {
    if (file?.buffer?.length) {
      return file.buffer;
    }

    if (filePath?.trim()) {
      return filePath;
    }

    throw new BadRequestException(
      "No CSV provided. Upload a file in the 'file' field or provide a filePath.",
    );
  }

  /**
   * Responds to a POST to "/parser/productions" with a file path in the body,
   * and injects productions from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for productions.
   * @param filePath The path to the CSV file containing production data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject productions from CSV file" })
  @ApiOkResponse({ description: "Productions CSV injected successfully" })
  @Post("productions")
  async injectProductions(
    @UploadedFile() file?: UploadedCsvFile,
    @Body("filePath") filePath?: string,
  ) {
    return this.csvInjectionService.injectProductionsCSV(
      this.getCsvSource(file, filePath),
    );
  }

  /**
   * Responds to a POST to "/parser/events" with a file path in the body,
   * and injects events from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for events.
   * @param filePath The path to the CSV file containing event data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject events from CSV file" })
  @ApiOkResponse({ description: "Events CSV injected successfully" })
  @Post("events")
  async injectEvents(
    @UploadedFile() file?: UploadedCsvFile,
    @Body("filePath") filePath?: string,
  ) {
    return this.csvInjectionService.injectEventsCSV(
      this.getCsvSource(file, filePath),
    );
  }

  /**
   * Responds to a POST to "/parser/tags" with a file path in the body,
   * and injects tags from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for tags.
   * @param filePath The path to the CSV file containing tag data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject tags from CSV file" })
  @ApiOkResponse({ description: "Tags CSV injected successfully" })
  @Post("tags")
  async injectTags(
    @UploadedFile() file?: UploadedCsvFile,
    @Body("filePath") filePath?: string,
  ) {
    return this.csvInjectionService.injectTagsCSV(
      this.getCsvSource(file, filePath),
    );
  }

  /**
   * Responds to a POST to "/parser/blogs" with a file path in the body,
   * and injects blogs from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for blogs.
   * @param filePath The path to the CSV file containing blog data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject blogs from CSV file" })
  @ApiOkResponse({ description: "Blogs CSV injected successfully" })
  @Post("blogs")
  async injectBlogs(
    @UploadedFile() file?: UploadedCsvFile,
    @Body("filePath") filePath?: string,
  ) {
    return this.csvInjectionService.injectBlogsCSV(
      this.getCsvSource(file, filePath),
    );
  }

  /**
   * Responds to a POST to "/parser/prices" with a file path in the body,
   * and injects prices from the specified CSV file into the database.
   * The CSV file should be formatted according to the expected schema for prices.
   * @param filePath The path to the CSV file containing price data to be injected.
   */
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiSecurity("api_key")
  @ApiOperation({ summary: "Inject prices from CSV file" })
  @ApiOkResponse({ description: "Prices CSV injected successfully" })
  @Post("prices")
  async injectPrices(
    @UploadedFile() file?: UploadedCsvFile,
    @Body("filePath") filePath?: string,
  ) {
    return this.csvInjectionService.injectPricesCSV(
      this.getCsvSource(file, filePath),
    );
  }
}
