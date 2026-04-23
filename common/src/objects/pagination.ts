import { z } from "zod";

// Needed to apply the query in practice.
export const QueryBoolean = z.preprocess((val) => {
  if (typeof val === "string") return val.toLowerCase() === "true";
  return val;
}, z.boolean());

// Filter object.
export const PaginationFilterSchema = z.object({
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(0).max(100).default(20),
  descending: QueryBoolean.default(true), // This will only change things if there is sorting going on.
});

// Type exports.
export type PaginationFilter = z.infer<typeof PaginationFilterSchema>;

// Paginated Response is a non ZOD type because of it's nature of only being
// returned by the API.
export type PaginatedResponse<T> = {
  page: number;
  limit: number;
  totalItems: number;
  objects: T[];
};
