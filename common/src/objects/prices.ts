import { z } from "zod";

export const PriceSchema = z.object({
  id: z.number(),
  price: z.float32(),
  name: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  legacy_id: z.string().nullable(),
});
export const CreatePriceSchema = PriceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdatePriceSchema = PriceSchema.partial();

export type Price = z.infer<typeof PriceSchema>;
export type CreatePrice = z.infer<typeof CreatePriceSchema>;
export type UpdatePrice = z.infer<typeof UpdatePriceSchema>;
