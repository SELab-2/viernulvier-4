import { z } from "zod";
import { LocalizedStringSchema } from "./language";

// Base Location object.
export const LocationSchema = z.object({
  id: z.number(),
  location: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  // Legacy ID is omitted here because the API doesn't use it.
});

// Localized Location object.
export const LocationViewSchema = LocationSchema.extend({
  location: z.string(),
});

// Omits read-only fields.
const MutableLocationSchema = LocationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating & Creating.
export const CreateLocationSchema = MutableLocationSchema;
export const ModifyLocationSchema = MutableLocationSchema.partial();
// Replace is left out here since Location only has ONE field.

// Filtering.
export const FilterLocationSchema = z.object({
  location: z.string().optional(),
});

// Type exports.
export type Location = z.infer<typeof LocationSchema>;
export type LocationView = z.infer<typeof LocationViewSchema>;
export type CreateLocation = z.infer<typeof CreateLocationSchema>;
export type ModifyLocation = z.infer<typeof ModifyLocationSchema>;
export type FilterLocation = z.infer<typeof FilterLocationSchema>;
