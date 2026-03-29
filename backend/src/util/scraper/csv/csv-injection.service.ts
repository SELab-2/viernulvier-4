import { Injectable } from "@nestjs/common";
import { UtilsDbConnection } from "../database/db.connection";
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

  async injectProductionsCSV(filePath: string) {
    return injectProductionsCSV(filePath, this.dbConnection);
  }

  async injectEventsCSV(filePath: string) {
    return injectEventsCSV(filePath, this.dbConnection);
  }

  async injectTagsCSV(filePath: string) {
    return injectTagsCSV(filePath, this.dbConnection);
  }

  async injectBlogsCSV(filePath: string) {
    return injectBlogsCSV(filePath, this.dbConnection);
  }

  async injectPricesCSV(filePath: string) {
    return injectPricesCSV(filePath, this.dbConnection);
  }

  async injectOldCsvData() {
    return injectOldCsvData(this.dbConnection);
  }
}
