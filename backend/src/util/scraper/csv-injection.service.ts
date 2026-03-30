import { Injectable } from "@nestjs/common";
import { UtilsDbConnection } from "./database/db.connection";
import {
  injectBlogsCSV,
  injectEventsCSV,
  injectOldCsvData,
  injectPricesCSV,
  injectProductionsCSV,
  injectTagsCSV,
} from "./inject-csv";

@Injectable()
export class CsvInjectionService {
  constructor(private readonly dbConnection: UtilsDbConnection) {}

  async injectProductionsCSV(input: string | Buffer) {
    return injectProductionsCSV(input, this.dbConnection);
  }

  async injectEventsCSV(input: string | Buffer) {
    return injectEventsCSV(input, this.dbConnection);
  }

  async injectTagsCSV(input: string | Buffer) {
    return injectTagsCSV(input, this.dbConnection);
  }

  async injectBlogsCSV(input: string | Buffer) {
    return injectBlogsCSV(input, this.dbConnection);
  }

  async injectPricesCSV(input: string | Buffer) {
    return injectPricesCSV(input, this.dbConnection);
  }

  async injectOldCsvData() {
    return injectOldCsvData(this.dbConnection);
  }
}
