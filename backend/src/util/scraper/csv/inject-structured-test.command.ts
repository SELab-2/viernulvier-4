import { Command, CommandRunner } from "nest-commander";
import { InjectCsvEngine } from "./inject-csv.engine";
import { AppLogger } from "../../logger/logger.service";
import { Injectable } from "@nestjs/common";
import path from "path";

type StructuredCsvPaths = {
  productions: string;
  events: string;
  tags: string;
  blogs: string;
  prices: string;
};

@Injectable()
@Command({
  name: "scraper:inject:structured:test",
  description: "Will run a quick CSV parser test.",
})
export class InjectStructuredCsvTest extends CommandRunner {
  constructor(
    private readonly logger: AppLogger,
    private readonly engine: InjectCsvEngine,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    await this.runStructuredCsvSmokeTest();
  }

  private buildStructuredCsvPaths(baseDir: string): StructuredCsvPaths {
    return {
      productions: path.join(baseDir, "productions_test.csv"),
      events: path.join(baseDir, "events_test.csv"),
      tags: path.join(baseDir, "tags_test.csv"),
      blogs: path.join(baseDir, "blogs_test.csv"),
      prices: path.join(baseDir, "prices_test.csv"),
    };
  }

  /**
   * Runs a one-command smoke test for structured CSV importers.
   * Order matters for linking: productions -> events -> tags -> blogs -> prices.
   */
  private async runStructuredCsvSmokeTest(baseDir?: string) {
    const resolvedBaseDir = baseDir
      ? path.resolve(process.cwd(), baseDir)
      : path.resolve(
          process.cwd(),
          "..",
          "common",
          "res",
          "structured_test_csv",
        );

    const csvPaths = buildStructuredCsvPaths(resolvedBaseDir);

    this.logger.log(
      `Structured CSV smoke test started. Base dir: ${resolvedBaseDir}`,
    );

    await this.engine.injectProductionsCSV(csvPaths.productions);
    await this.engine.injectEventsCSV(csvPaths.events);
    await this.engine.injectTagsCSV(csvPaths.tags);
    await this.engine.injectBlogsCSV(csvPaths.blogs);
    await this.engine.injectPricesCSV(csvPaths.prices);

    this.logger.log("Structured CSV smoke test completed.");
  }
}

function buildStructuredCsvPaths(baseDir: string): StructuredCsvPaths {
  return {
    productions: path.join(baseDir, "productions_test.csv"),
    events: path.join(baseDir, "events_test.csv"),
    tags: path.join(baseDir, "tags_test.csv"),
    blogs: path.join(baseDir, "blogs_test.csv"),
    prices: path.join(baseDir, "prices_test.csv"),
  };
}
