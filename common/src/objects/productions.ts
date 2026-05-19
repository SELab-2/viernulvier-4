import { z } from "zod";
import {
  LocalizedStringNullableSchema,
  LocalizedStringSchema,
} from "./language";
import { QueryBoolean } from "./pagination";

// Base Production object.
export const ProductionSchema = z.object({
  id: z.number(),
  titel: LocalizedStringSchema,
  description1: LocalizedStringSchema,
  description2: LocalizedStringNullableSchema,
  artist: LocalizedStringNullableSchema,
  tagline: LocalizedStringNullableSchema,
  credits: LocalizedStringNullableSchema,
  performer_type: z.string().nullable(),
  attendance_mode: z.string().nullable(),
  created_at: z.iso.datetime().nullable(),
  updated_at: z.iso.datetime().nullable(),
  // Legacy ID is omitted here because the API doesn't use it.
});

// Localized Production object.
export const ProductionViewSchema = ProductionSchema.extend({
  titel: z.string(),
  description1: z.string(),
  description2: z.string(),
  tagline: z.string().nullable(),
  credits: z.string().nullable(),
  artist: z.string().nullable(),
});

// Omits read-only fields.
const MutableProductionSchema = ProductionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating & Creating.
export const CreateProductionSchema = MutableProductionSchema;
export const ModifyProductionSchema = MutableProductionSchema.partial();
export const ReplaceProductionSchema = MutableProductionSchema;

// Filtering.
export const FilterProductionSchema = z.object({
  titelOrArtist: z.string().optional(),
  tag_ids: z.preprocess((val) => {
    // 1. Handle missing, null, or empty string -> undefined
    if (val === undefined || val === null || val === "") return undefined;

    // 2. Normalize single value to array
    if (!Array.isArray(val)) return [Number(val)];

    // 3. Ensure array elements are numbers
    return val.map(Number);
  }, z.array(z.number()).optional()),
  hall: z.string().optional(),
  before: z.iso.date().optional(),
  after: z.iso.date().optional(),
  performer_type: z.string().optional(),
  attendance_mode: z.string().optional(),

  // This will return all productions that are tied to the blog.
  blog_id: z.coerce.number().optional(),
  // This will return all productions that are tied to a print.
  print_id: z.coerce.number().optional(),

  // Toggle for the backend to treat the request as a suggestion.
  is_suggestion: QueryBoolean.default(false),
});

// Type exports.
export type Production = z.infer<typeof ProductionSchema>;
export type ProductionView = z.infer<typeof ProductionViewSchema>;
export type CreateProduction = z.infer<typeof CreateProductionSchema>;
export type ModifyProduction = z.infer<typeof ModifyProductionSchema>;
export type ReplaceProduction = z.infer<typeof ReplaceProductionSchema>;
export type FilterProduction = z.infer<typeof FilterProductionSchema>;
