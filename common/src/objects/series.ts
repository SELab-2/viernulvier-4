import z from "zod";
import { LocalizedStringSchema } from "./language";

// Base Series object.
export const SeriesSchema = z.object({
  id: z.number(),
  titel: LocalizedStringSchema,
  description: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  // Legacy ID is omitted here because the API doesn't use it.
});

// Localized Series object.
export const SeriesViewSchema = SeriesSchema.extend({
  titel: z.string(),
  description: z.string(),
});

// Omits read-only fields.
const MutableSeriesSchema = SeriesSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating & Creating.
export const CreateSeriesSchema = MutableSeriesSchema;
export const ModifySeriesSchema = MutableSeriesSchema.partial();
export const ReplaceSeriesSchema = MutableSeriesSchema;

// Type exports.
export type Series = z.infer<typeof SeriesSchema>;
export type SeriesView = z.infer<typeof SeriesViewSchema>;
export type CreateSeries = z.infer<typeof CreateSeriesSchema>;
export type ModifySeries = z.infer<typeof ModifySeriesSchema>;
export type ReplaceSeries = z.infer<typeof ReplaceSeriesSchema>;
