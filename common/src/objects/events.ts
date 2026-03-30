import { z } from "zod";

// Base Event object.
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

// Omits read-only fields.
const MutableEventSchema = EventSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating and creating.
export const CreateEventSchema = MutableEventSchema;
export const ModifyEventSchema = MutableEventSchema.partial();
export const ReplaceEventSchema = MutableEventSchema;

// Filtering.
export const FilterEventSchema = z.object({
  date: z.iso.date().optional(),
  date_between: z.iso.date().optional(),
  date_before: z.iso.date().optional(),
  date_after: z.iso.date().optional(),
  id: z.coerce.number().optional(),
  production_id: z.coerce.number().optional(),
});

// Type exports.
export type Event = z.infer<typeof EventSchema>;
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export type ModifyEvent = z.infer<typeof ModifyEventSchema>;
export type ReplaceEvent = z.infer<typeof ReplaceEventSchema>;
export type FilterEvent = z.infer<typeof FilterEventSchema>;
