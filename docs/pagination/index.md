# Pagination Overview

Certain endpoints return a `PaginatedResponse<T>` object, which allows you to fetch long lists of items in smaller, manageable chunks.

## Request Parameters

To paginate through a collection, append these query parameters to your endpoint URL (e.g. `/endpoint?page=1&limit=20`):

* **`page`** (integer): The page of data to retrieve. **Pages are 0-indexed**. Defaults to `0` for all supported endpoints.
* **`limit`** (integer): The number of items to return per page. Defaults to `20` for all endpoints with a maximum of `100`.

## Response Structure

A `PaginatedResponse<T>` carries the metadata needed to compute total pages and build navigation, along with the actual array of objects (`T`).

* **`page`**: The current page of data returned.
* **`limit`**: The maximum amount of objects per page.
* **`totalItems`**: The total amount of items over all pages in the database.
* **`object`**: An array of type `T`. Carries the actual objects.

### Example Response

Fetching `/endpoint?page=0&limit=20` (Returns items 1-20):

```json
{
  "page": 0,
  "limit": 20,
  "totalItems": 145,
  "object": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
    // ... up to 20 items
  ]
}
```
