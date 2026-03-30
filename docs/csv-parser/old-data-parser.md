# Old Data CSV Parser (Project-Specific)

This page documents the legacy CSV parser that imports historical data bundled in this repository.

## Scope and Intent

This parser is **not a general import interface**. It exists only to inject the old csv data given in files.

The flow is designed around that exact legacy column shape.

## Where It Runs

The old-data import is triggered automatically during scraper bootstrap when scraping is enabled.

## Input Files and Expected Columns

### Legacy productions file

Header starts with:

- `Titel, Ondertitel, Description1, Description2, Genre, ID, Planning ID`

Used fields in parsing:

| Field          | Required | Notes                                  |
| -------------- | -------- | -------------------------------------- |
| `ID`           | Yes      | Required numeric identifier            |
| `Titel`        | Yes      | Title                                  |
| `Description1` | Yes      | Primary description                    |
| `Description2` | No       | Optional second description            |
| `Ondertitel`   | No       | Optional tagline (fallback: `Tagline`) |
| `Genre`        | No       | Comma-separated tags                   |

### Legacy events file

Header starts with:

- `Starttime, Endtime, Hall, Production`

Used fields in parsing:

| Field        | Required | Notes                                       |
| ------------ | -------- | ------------------------------------------- |
| `Starttime`  | Yes      | Required valid date                         |
| `Endtime`    | No       | Invalid placeholders are treated as missing |
| `Hall`       | Yes      | Location name                               |
| `Production` | Yes      | Required numeric production reference       |

## How the Old Parser Works

The old parser runs a straightforward import flow:

1. Read and validate legacy productions and events rows.
2. Normalize the data into the archive format.
3. Build related links (for example tags and locations).
4. Insert the data in dependency-safe order.

Invalid rows are skipped and logged, so one bad row does not stop the full import.

## Constraints and Restrictions

- Only supports the old project CSV layout.
- Input source is fixed by the legacy bootstrap flow.
- No parser API endpoint is exposed for this legacy flow.
- Data assumptions are legacy-specific:
  - hall as a single string
  - old date placeholders (`0000-00-00 00:00:00`, `1970-01-01 00:00:00`)
  - tags encoded in one `Genre` field
- Invalid rows are skipped with warning logs.

## Operational Notes

- This import is mainly for the initial historical data.
- For new or recurring CSV imports, use the structured parser flow documented on the [new parser page](new-data-parser.md).
