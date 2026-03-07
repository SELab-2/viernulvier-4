import "dotenv/config";

async function fetchProductions(): Promise<object[]> {
  const url = "https://www.viernulvier.gent/api/v1/productions";
  const apiKey = process.env.CLIENT_API_KEY;

  if (!apiKey) {
    console.error("Make sure to set CLIENT_API_KEY in .env!");
    return [];
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/ld+json",
        "X-AUTH-TOKEN": `${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    console.log(await response.json());
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return [];
  }

  return [];
}

fetchProductions().then();
