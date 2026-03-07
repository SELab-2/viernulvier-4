import "dotenv/config";
import { URLSearchParams } from "url";

const apiBase: string = "https://www.viernulvier.gent";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Definition of a Response from the API.
interface apiResponse {
  view: viewState;
  member: object[];
}

// The state of the View for lists and pages of objects.
interface viewState {
  next: string | null;
}

/**
 * Helper function that will return an apiResponse object.
 * @param target The full URL to fetch.
 * @returns The apiResponse for that URL.
 */
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
export async function scrapeMany(
  url: string,
  updatedAfter: string,
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

/**
 * Scrapes one single object from the URL.
 * @param url The URL we want to scrape from.
 * @returns The object that has been scraped.
 */
export async function scrapeOne(url: string): Promise<object> {
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
