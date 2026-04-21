/**
 * Print Items.
 */

import z from "zod";
import { LocalizedStringSchema } from "./language";

// Allowed print types.
export const PrintTypeValues = [
  "affiche",
  "brochure",
  "drukwerk",
  "programma",
] as const;

export const PrintTypeSchema = z.enum(PrintTypeValues);

export type PrintType = z.infer<typeof PrintTypeSchema>;

// Base Print Item object.
export const PrintItemSchema = z.object({
  id: z.number(),
  titel: LocalizedStringSchema,
  description: LocalizedStringSchema,
  url: z.string(),
  print_type: PrintTypeSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Localized Print Item object.
export const PrintItemViewSchema = PrintItemSchema.extend({
  titel: z.string(),
  description: z.string(),
});

// Omits read-only fields.
const MutablePrintItemSchema = PrintItemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating and creating.
export const CreatePrintItemSchema = MutablePrintItemSchema.extend({
  gallery_ids: z.array(z.number().int().positive()).optional(),
});
export const ModifyPrintItemSchema = MutablePrintItemSchema.partial();
export const ReplacePrintItemSchema = MutablePrintItemSchema;

// Filtering.
export const FilterPrintItemSchema = z.object({
  title: z.string().optional(),
  type: PrintTypeSchema.optional(),
});

// Type exports.
export type PrintItem = z.infer<typeof PrintItemSchema>;
export type PrintItemView = z.infer<typeof PrintItemViewSchema>;
export type CreatePrintItem = z.infer<typeof CreatePrintItemSchema>;
export type ModifyPrintItem = z.infer<typeof ModifyPrintItemSchema>;
export type ReplacePrintItem = z.infer<typeof ReplacePrintItemSchema>;
export type FilterPrintItem = z.infer<typeof FilterPrintItemSchema>;
