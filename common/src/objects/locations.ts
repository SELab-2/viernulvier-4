import { z } from "zod";
import { LocalizedStringSchema } from "./language";

export const LocationSchema = z.object({
  id: z.number(),
  location: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  // Legacy ID is omitted here because the API doesn't use it.
});
export const LocationViewSchema = LocationSchema.extend({
  location: z.string(),
});

export const CreateLocationSchema = LocationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateLocationSchema = LocationSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Location = z.infer<typeof LocationSchema>;
export type LocationView = z.infer<typeof LocationViewSchema>;
export type CreateLocation = z.infer<typeof CreateLocationSchema>;
export type UpdateLocation = z.infer<typeof UpdateLocationSchema>;
