import { z } from "zod";

export const EventSchema = z.object({
  id: z.number(),
  starttime: z.iso.datetime(),
  endtime: z.iso.datetime().nullable(),
  doors_at: z.iso.datetime().nullable(),
  intermission_at: z.iso.datetime().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  production_id: z.number(),
  // Legacy ID is omitted here because the API doesn't use it.
});

export const CreateEventSchema = EventSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateEventSchema = EventSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const FilterEventSchema = z.object({
  date: z.iso.date().optional(),
  date_between: z.iso.date().optional(),
  date_before: z.iso.date().optional(),
  date_after: z.iso.date().optional(),
  id: z.coerce.number().optional(),
  production_id: z.coerce.number().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type Event = z.infer<typeof EventSchema>;
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export type UpdateEvent = z.infer<typeof UpdateEventSchema>;
export type FilterEvent = z.infer<typeof FilterEventSchema>;
