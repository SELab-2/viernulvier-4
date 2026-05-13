import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { CsvInjectionService } from "../util/scraper/csv/csv-injection.service";
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";
import { FileInterceptor } from "@nestjs/platform-express";
import { ParserUploadCsvBodyDto } from "../dto/dto";

type UploadedCsvFile = {
  buffer: Buffer;
  // Optional MIME type for validation purposes, is automatically added by FileInterceptor when a file is uploaded, but can be undefined if the file is provided via filePath instead.
  mimetype?: string;
};

@Controller("parser")
export class ParserController {
  constructor(private readonly csvInjectionService: CsvInjectionService) {}

  private readonly acceptedCsvMimeTypes = new Set([
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "text/plain",
  ]);

  /**
   * Helper method to determine the CSV source from the uploaded file or file path, with validation for accepted MIME types when a file is uploaded.
   * If both sources are provided, the uploaded file takes precedence. If neither source is valid, a BadRequestException is thrown.
   */
  private getCsvSource(
    file?: UploadedCsvFile,
    filePath?: string,
  ): string | Buffer {
    if (file?.buffer?.length) {
      if (
        file.mimetype &&
        !this.acceptedCsvMimeTypes.has(file.mimetype.toLowerCase())
      ) {
        throw new BadRequestException(
          `Unsupported file type '${file.mimetype}'. Please upload a CSV file.`,
        );
      }

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
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: ParserUploadCsvBodyDto })
  @ApiSecurity("apiKey")
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
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: ParserUploadCsvBodyDto })
  @ApiSecurity("apiKey")
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
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: ParserUploadCsvBodyDto })
  @ApiSecurity("apiKey")
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
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: ParserUploadCsvBodyDto })
  @ApiSecurity("apiKey")
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
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: ParserUploadCsvBodyDto })
  @ApiSecurity("apiKey")
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
