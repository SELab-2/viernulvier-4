import { z } from "zod";
import {
  LanguageEnum,
  LocalizedStringNullableSchema,
  LocalizedStringSchema,
} from "./language";

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
export const ProductionViewSchema = ProductionSchema.extend({
  titel: z.string(),
  description1: z.string(),
  description2: z.string(),
  tagline: z.string().nullable(),
  credits: z.string().nullable(),
  artist: z.string().nullable(),
});
export const CreateProductionSchema = ProductionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateProductionSchema = ProductionSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const FilterProductionSchema = z.object({
  lang: LanguageEnum.optional(),
  titel: z.string().optional(),
  id: z.coerce.number().optional(),
  tag_ids: z
    .union([z.coerce.number(), z.array(z.coerce.number())])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (Array.isArray(val)) return val;
      return [val];
    }),
  hall: z.string().optional(),
  date: z.iso.date().optional(),
  date_between: z.iso.date().optional(),
  date_before: z.iso.date().optional(),
  date_after: z.iso.date().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(20),
  artist: z.string().optional(),
  performer_type: z.string().optional(),
  attendance_mode: z.string().optional(),
});

export type Production = z.infer<typeof ProductionSchema>;
export type ProductionView = z.infer<typeof ProductionViewSchema>;
export type CreateProduction = z.infer<typeof CreateProductionSchema>;
export type UpdateProduction = z.infer<typeof UpdateProductionSchema>;
export type FilterProduction = z.infer<typeof FilterProductionSchema>;
