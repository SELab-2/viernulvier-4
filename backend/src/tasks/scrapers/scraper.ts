import "dotenv/config";
import { URLSearchParams } from "url";

const apiBase: string = "https://www.viernulvier.gent";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface apiResponse {
  view: viewState;
  member: object[];
}

interface viewState {
  next: string | null;
}

export interface vnvLocal {
  en?: string;
  nl?: string;
}

function extractIdFromUri(uri: string): string | null {
  const extractedId = uri.replace(/\/$/, "").split("/").pop();
  return extractedId || null;
}

// The Production Interface we want to simplify to.
interface vnvProduction {
  legacy_id?: string;
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
  events?: vnvEvent[];
}
async function parseVnvProduction(
  object: Record<string, any>,
): Promise<vnvProduction> {
  const events: vnvEvent[] = [];
  for (const eventUrl of object.events) {
    const eventObject: object = await scrapeOne(eventUrl as string);
    events.push(parseVnvEvent(eventObject));
  }

  const production: vnvProduction = {
    legacy_id: extractIdFromUri(object["@id"] as string) || "",
    created_at: (object.created_at as string) || "1970-01-01T00:00:00+00:00",
    updated_at: (object.updated_at as string) || "1970-01-01T00:00:00+00:00",
    performer_type: (object.performer_type as string) || "N/A",
    attendance_mode: (object.attendance_mode as string) || "N/A",
    title: (object.title as vnvLocal) || { en: "N/A", nl: "N/a" },
    artist: (object.artist as vnvLocal) || { en: "N/A", nl: "N/a" },
    tagline: (object.tagline as vnvLocal) || { en: "N/A", nl: "N/a" },
    description: (object.description as vnvLocal) || { en: "N/A", nl: "N/a" },
    description_2: (object.description_2 as vnvLocal) || {
      en: "N/A",
      nl: "N/a",
    },
    info: (object.info as vnvLocal) || { en: "N/A", nl: "N/a" },
    events: events,
  };

  return production;
}

interface vnvEvent {
  legacy_id?: string;
  created_at?: string;
  updated_at?: string;
  starts_at?: string;
  ends_at?: string;
  intermission_at?: string;
  doors_at?: string;
  hall?: object; // TODO: Replace this with vnvHall.
  prices?: object[]; // TODO: Replace this with vnvPrice.
}
function parseVnvEvent(object: Record<string, any>): vnvEvent {
  const event: vnvEvent = {
    legacy_id: extractIdFromUri(object["@id"] as string) || "",
    created_at: (object.created_at as string) || "1970-01-01T00:00:00+00:00",
    updated_at: (object.updated_at as string) || "1970-01-01T00:00:00+00:00",
    starts_at: (object.starts_at as string) || "1970-01-01T00:00:00+00:00",
    ends_at: (object.ends_at as string) || "1970-01-01T00:00:00+00:00",
    intermission_at:
      (object.intermission_at as string) || "1970-01-01T00:00:00+00:00",
    doors_at: (object.doors_at as string) || "1970-01-01T00:00:00+00:00",
    hall: (object.hall as object) || {},
    prices: (object.prices as object[]) || [],
  };

  return event;
}

async function fetchFromVnv(target: string): Promise<apiResponse> {
  console.log(`Fetching from ${target}.`);
  const apiKey = process.env.CLIENT_API_KEY;
  if (!apiKey) throw new Error("Forgot to set CLIENT_API_KEY in .env?");

  const response = await fetch(target, {
    method: "GET",
    headers: {
      accept: "application/ld+json",
      "X-AUTH-TOKEN": `${apiKey}`,
    },
  });

  if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
  const jsonResponse: apiResponse = (await response.json()) as apiResponse;
  return jsonResponse;
}

/**
 * Scrapes data starting from the provided URL.
 * @param url The URL we want to start from, this is not including the base part of the url.
 * @param updatedAfter Optional Date that defines which data we want.
 * @returns A list of all the scraped objects. Generically typed.
 */
async function scrapeUrl(
  url: string,
  updatedAfter: string = "1970-01-01T00:00:00+00:00",
): Promise<object[]> {
  console.log(
    `Scraping objects from ${url} with last update time after ${updatedAfter}.`,
  );

  const apiKey = process.env.CLIENT_API_KEY;
  if (!apiKey) {
    console.error("Make sure to set CLIENT_API_KEY in .env!");
    return [];
  }

  const params = new URLSearchParams();
  params.append("updated_at[after]", updatedAfter);
  let view: viewState = {
    next: url + "&" + params.toString(),
  };
  const output: object[] = [];

  while (view.next) {
    try {
      const target: string = apiBase + view.next;

      const jsonResponse: apiResponse = await fetchFromVnv(target);
      view = jsonResponse.view;

      output.push(...jsonResponse.member);
      await delay(1000);
    } catch (error) {
      console.error("An error occurred: ", error);
      console.log("Retrying...");
      await delay(5000); // Wait a bit longer before retrying.
    }
  }

  console.log(`Scraped ${output.length} objects.`);
  return output;
}

async function scrapeOne(url: string): Promise<object> {
  console.log(`Scraping one resource from ${url}.`);

  const apiKey = process.env.CLIENT_API_KEY;
  if (!apiKey) {
    console.error("Make sure to set CLIENT_API_KEY in .env!");
    return [];
  }

  try {
    const target: string = apiBase + url;

    const jsonResponse: apiResponse = await fetchFromVnv(target);
    return jsonResponse;
  } catch (error) {
    console.error("An error occurred: ", error);
    return {};
  }
}

export async function scrape() {
  // TODO: Add the date query to this.
  const productions: vnvProduction[] = (await scrapeUrl(
    "/api/v1/productions?page=1",
    "2026-03-04T09:36:21+00:00",
  )) as vnvProduction[];

  for (const production of productions) {
    const vnvProduction: vnvProduction = await parseVnvProduction(production);
    console.log(vnvProduction);
  }
}

void scrape();
