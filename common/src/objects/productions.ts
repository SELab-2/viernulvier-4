import { z } from "zod";
import {
  LocalizedStringNullableSchema,
  LocalizedStringSchema,
} from "./language";

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
  created_at: z.iso.datetime().nullable(), // TODO remove nullable when update csv parser bcs otherwise doesnt work.
  updated_at: z.iso.datetime().nullable(), // TODO here too.
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
  tag_ids: z
    .union([z.coerce.number(), z.array(z.coerce.number())])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (Array.isArray(val)) return val;
      return [val];
    }),
  hall: z.string().optional(),
  before: z.iso.date().optional(),
  after: z.iso.date().optional(),
  performer_type: z.string().optional(),
  attendance_mode: z.string().optional(),
});

// Type exports.
export type Production = z.infer<typeof ProductionSchema>;
export type ProductionView = z.infer<typeof ProductionViewSchema>;
export type CreateProduction = z.infer<typeof CreateProductionSchema>;
export type ModifyProduction = z.infer<typeof ModifyProductionSchema>;
export type ReplaceProduction = z.infer<typeof ReplaceProductionSchema>;
export type FilterProduction = z.infer<typeof FilterProductionSchema>;
