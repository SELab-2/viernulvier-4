import { Injectable } from "@nestjs/common";
import { UtilsDbConnection } from "../database/scraper.db.service";
import { InjectCsvEngine } from "./inject-csv.engine";

@Injectable()
export class CsvInjectionService {
  constructor(
    private readonly dbConnection: UtilsDbConnection,
    private readonly engine: InjectCsvEngine,
  ) {}

  async injectProductionsCSV(input: string | Buffer) {
    return this.engine.injectProductionsCSV(input);
  }

  async injectEventsCSV(input: string | Buffer) {
    return this.engine.injectEventsCSV(input);
  }

  async injectTagsCSV(input: string | Buffer) {
    return this.engine.injectTagsCSV(input);
  }

  async injectBlogsCSV(input: string | Buffer) {
    return this.engine.injectBlogsCSV(input);
  }

  async injectPricesCSV(input: string | Buffer) {
    return this.engine.injectPricesCSV(input);
  }

  async injectOldCsvData() {
    return this.engine.injectOldCsvData();
  }
}
