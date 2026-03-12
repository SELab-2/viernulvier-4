import { z } from "zod";

export const PaginationFilterSchema = z.object({
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(0).max(100).default(20),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    page: z.coerce.number().min(0).default(0),
    limit: z.coerce.number().min(0).max(100).default(20),
    totalItems: z.coerce.number(),
    objects: z.array(schema),
  });

export type PaginationFilter = z.infer<typeof PaginationFilterSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;
