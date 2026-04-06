/**
 * Print Items.
 */

import z from "zod";
import { LocalizedStringSchema } from "./language";

// Base Print Item object.
export const PrintItemSchema = z.object({
  id: z.number(),
  titel: LocalizedStringSchema,
  description: LocalizedStringSchema,
  url: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Localized Print Item object.
export const PrintItemViewSchema = PrintItemSchema.extend({
    titel: z.string(),
    description: z.string(),
});

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

export type PrintItem = z.infer<typeof PrintItemSchema>;
export type PrintItemView = z.infer<typeof PrintItemViewSchema>;
export type CreatePrintItem = z.infer<typeof CreatePrintItemSchema>;
export type ModifyPrintItem = z.infer<typeof ModifyPrintItemSchema>;
export type ReplacePrintItem = z.infer<typeof ReplacePrintItemSchema>;
