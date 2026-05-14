import z from "zod";
import { LocalizedStringSchema } from "./language";
import { QueryBoolean } from "./pagination";

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

// Filtering.
export const FilterSeriesSchema = z.object({
  title: z.string().optional(),
  production_id: z.coerce.number().optional(),

  // Toggle for the backend to treat this request as a suggestion.
  is_suggestion: QueryBoolean.default(false),
});

// Type exports.
export type Series = z.infer<typeof SeriesSchema>;
export type SeriesView = z.infer<typeof SeriesViewSchema>;
export type CreateSeries = z.infer<typeof CreateSeriesSchema>;
export type ModifySeries = z.infer<typeof ModifySeriesSchema>;
export type ReplaceSeries = z.infer<typeof ReplaceSeriesSchema>;
export type FilterSeries = z.infer<typeof FilterSeriesSchema>;
