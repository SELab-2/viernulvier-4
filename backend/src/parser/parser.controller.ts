import { Controller } from "@nestjs/common";

import { CsvInjectionService } from "../util/scraper/csv-injection.service";

@Controller("parser")
export class ParserController {
  constructor(private readonly csvInjectionService: CsvInjectionService) {}
}
