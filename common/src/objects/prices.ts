import { z } from "zod";
import { LocalizedStringSchema } from "./language";

export const PriceSchema = z.object({
  id: z.number(),
  price: z.float32(),
  name: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  // Legacy ID is omitted here because the API doesn't use it.
});
export const PriceViewSchema = PriceSchema.extend({
  name: z.string(),
});

export const CreatePriceSchema = PriceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdatePriceSchema = PriceSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Price = z.infer<typeof PriceSchema>;
export type PriceView = z.infer<typeof PriceViewSchema>;
export type CreatePrice = z.infer<typeof CreatePriceSchema>;
export type UpdatePrice = z.infer<typeof UpdatePriceSchema>;
