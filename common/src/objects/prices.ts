import { z } from "zod";
import { LocalizedStringSchema } from "./language";

// Base Price object.
export const PriceSchema = z.object({
  id: z.number(),
  price: z.float32(),
  name: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  // Legacy ID is omitted here because the API doesn't use it.
});

// Localized Price object.
export const PriceViewSchema = PriceSchema.extend({
  name: z.string(),
});

// Omits read-only fields.
const MutablePriceSchema = PriceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating & Creating.
export const CreatePriceSchema = MutablePriceSchema;
export const ModifyPriceSchema = MutablePriceSchema.partial();
export const ReplacePriceSchema = MutablePriceSchema;

// Type exports.
export type Price = z.infer<typeof PriceSchema>;
export type PriceView = z.infer<typeof PriceViewSchema>;
export type CreatePrice = z.infer<typeof CreatePriceSchema>;
export type ModifyPrice = z.infer<typeof ModifyPriceSchema>;
export type ReplacePrice = z.infer<typeof ReplacePriceSchema>;
