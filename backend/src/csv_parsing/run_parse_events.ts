import fs from "fs";
import path from "path";
import process from "process";
import { CSVParser } from "./csv_parser";

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error(
      "Usage: npx ts-node src/csv_parsing/run_parse_events.ts <csv-file> [maxPrint]",
    );
    process.exit(1);
  }

  const file = path.resolve(argv[0]);
  const maxPrint = argv[1] ? Number(argv[1]) : 10;

  if (!fs.existsSync(file)) {
    console.error("File not found:", file);
    process.exit(2);
  }

  try {
    const events = await CSVParser.parseEventsCSV(file);
    console.log(`Parsed ${events.length} events from ${file}`);
    console.log(JSON.stringify(events.slice(0, maxPrint), null, 2));
  } catch (err) {
    console.error("Parsing failed:", err instanceof Error ? err.message : err);
    process.exit(3);
  }
}

void main();
