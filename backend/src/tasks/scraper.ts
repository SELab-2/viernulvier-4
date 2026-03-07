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
      console.log(`Fetching ${target}`);
      const response = await fetch(target, {
        method: "GET",
        headers: {
          accept: "application/ld+json",
          "X-AUTH-TOKEN": `${apiKey}`,
        },
      });

      if (!response.ok)
        throw new Error(`HTTP Error! Status: ${response.status}`);

      const jsonResponse: apiResponse = (await response.json()) as apiResponse;
      view = jsonResponse.view;

      output.push(...jsonResponse.member);
      await delay(1000);
    } catch (error) {
      console.error("An error occurred: ", error);
      console.log("Retrying...");
      await delay(5000); // Wait a bit longer before retrying.
    }
  }

  console.log(output.length);
  return output;
}

scrapeUrl("/api/v1/productions?page=1").then();
