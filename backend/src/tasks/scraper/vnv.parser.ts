import { scrapeOne } from "./scraper";

export interface vnvLocal {
  en?: string;
  nl?: string;
}

/**
 * EntryPoint for the parser. Will parse the fetched production Objects inside
 * and everything else that is nested in there too.
 * @param productions The list of productions that want to be parsed.
 * @returns The productions parsed to easier vnvProduction objects.
 */
export async function parseProductions(
  productions: object[],
): Promise<vnvProduction[]> {
  const parsedProductions: vnvProduction[] = [];
  for (const prodObject of productions) {
    const production: vnvProduction = await parseVnvProduction(prodObject);
    parsedProductions.push(production);
  }

  return parsedProductions;
}

/**
 * Helps to extract an ID from an URI.
 * @param uri The URI we want to get the ID from.
 * @returns The ID.
 */
function extractIdFromUri(uri: string): string | null {
  const extractedId = uri.replace(/\/$/, "").split("/").pop();
  return extractedId || null;
}

/**
 * Production
 */

// The Production Interface we want to simplify to.
export interface vnvProduction {
  legacy_id: string;
  created_at: string;
  updated_at: string;
  performer_type: string;
  attendance_mode: string;
  title: vnvLocal;
  artist: vnvLocal;
  tagline: vnvLocal;
  description: vnvLocal;
  description_2: vnvLocal;
  info: vnvLocal;
  events: vnvEvent[];
  genres: vnvGenre[];
}

/**
 * Parses to a single vnvProduction.
 * @param object The raw object that is meant to resemble a Production.
 * @returns The parsed vnvProduction.
 */
async function parseVnvProduction(
  object: Record<string, any>,
): Promise<vnvProduction> {
  const events: vnvEvent[] = [];
  for (const eventUrl of object.events) {
    const eventObject: object = await scrapeOne(eventUrl as string);
    events.push(parseVnvEvent(eventObject));
  }

  const genres: vnvGenre[] = [];
  for (const genreUrl of object.genres) {
    const genreObject: object = await scrapeOne(genreUrl as string);
    genres.push(parseVnvGenre(genreObject));
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
    genres: genres,
  };

  return production;
}

/**
 * Genre
 */

export interface vnvGenre {
  legacy_id: string;
  created_at: string;
  updated_at: string;
  name: vnvLocal;
}
function parseVnvGenre(object: Record<string, any>): vnvGenre {
  return {
    legacy_id: extractIdFromUri(object["@id"] as string) || "",
    created_at: (object.created_at as string) || "1970-01-01T00:00:00+00:00",
    updated_at: (object.updated_at as string) || "1970-01-01T00:00:00+00:00",
    name: (object.name as vnvLocal) || { en: "N/A", nl: "N/a" },
  };
}

/**
 * Event
 */

export interface vnvEvent {
  legacy_id: string;
  created_at: string;
  updated_at: string;
  starts_at: string;
  ends_at: string;
  intermission_at: string;
  doors_at: string;
  hall: object; // TODO: Replace this with vnvHall.
  prices: object[]; // TODO: Replace this with vnvPrice.
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
