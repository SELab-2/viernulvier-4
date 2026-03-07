import { scrapeUrl, vnvLocal } from "./scraper";

// This is the minimal interface we need to scrape these resources.
interface vnvProduction {
  "@id"?: string;
  created_at?: string;
  updated_at?: string;
  performer_type?: string;
  attendance_mode?: string;
  title?: vnvLocal;
  artist?: vnvLocal;
  tagline?: vnvLocal;
  description?: vnvLocal;
  description_2?: vnvLocal;
  info?: vnvLocal;
}

export async function scrapeProductions() {
  // TODO: Add the date query to this.
  const productions: vnvProduction[] = (await scrapeUrl(
    "/api/v1/productions?page=1",
    "2026-03-04T09:36:21+00:00",
  )) as vnvProduction[];

  console.log(productions);
}

void scrapeProductions();
