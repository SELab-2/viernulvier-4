import { z } from "zod";

export const PaginationFilterSchema = z.object({
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(0).max(100).default(20),
});

export type PaginationFilter = z.infer<typeof PaginationFilterSchema>;
