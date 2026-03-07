import { scrapeUrl } from "./scraper";

// This is the minimal interface we need to scrape these resources.
interface vnvEvent {
  "@id"?: string;
  created_at?: string;
  updated_at?: string;
  starts_at?: string;
  ends_at?: string;
  intermission_at?: string;
  doors_at?: string;
  hall?: string; // This is the url of the hall object, contains it's ID.
  prices?: string[]; // These are urls to the price objects.
}

export async function scrapeEvents() {
  // TODO: Add the date query to this.
  const events: vnvEvent[] = (await scrapeUrl(
    "/api/v1/events?page=1",
    "2026-03-04T09:36:21+00:00",
  )) as vnvEvent[];

  console.log(events);

  // TODO: Get the linked data for these Events and also add those.
}

void scrapeEvents();
