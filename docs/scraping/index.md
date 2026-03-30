# Scraping Overview

The backend comes with a built-in scheduled scraper that automatically syncs data from the [VierNulVier API](https://www.viernulvier.gent/api) into our database archive. Specifically, it pulls productions, events, genres, prices and halls.

For CSV import documentation, see the CSV Parser section:

- [CSV Parser Overview](../csv-parser/index.md)
- [Old Data Parser](../csv-parser/old-data-parser.md)
- [New Structured Parser](../csv-parser/new-data-parser.md)

## Technical Details

To avoid pulling the entire dataset every time, the scraper performs a **delta sync**. 

* **State Tracking:** It relies on the `scraper_dates` database table, which stores the timestamp of the last successful scrape. Only records modified or created after this timestamp are fetched.
* **Database Isolation:** The scraper initializes a dedicated, separate connection to the database. This ensures heavy insert/update operations do not block the connection pool used by the main backend services serving user requests.

## Setup & Configuration

To enable the scraper, the following environment variables are required:

* `ENABLE_SCRAPER=true`
* `CLIENT_API_KEY=[your_valid_viernulvier_api_key]`

No further manual setup is required. 

## Execution & Troubleshooting

#### Schedule 

When enabled, the scraper runs automatically on server initialization, and subsequently every day at exactly midnight (00:00 server time).

#### Manual Trigger

Currently there is no manual trigger to run the scraper. You will have to restart the backend to make it run again.

#### Resetting the Scraper

If you need to force a full re-scrape of all historical data, simply truncate the `scraper_dates` table and restart the server. 

A script `reset.ts` has been added together with the scraper that, when run, will remove all data from the database and reset the `scraper_dates` table. You can run this script by typing `npm run scraper:reset` in the root of the project.

!!! warning "Data Deletion"
    This script will remove **ALL** data from the database. Use with caution.

After you've run the reset script you can run the scraper again to fetch all data again.

#### Error Handling

If the VierNulVier API is unreachable or the key is invalid, the scraper will log an error to the log file and will gracefully abort without crashing the main application. It will attempt to scrape again at the next scheduled interval.
