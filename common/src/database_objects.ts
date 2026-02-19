import { z } from "zod";

// Production object
export const ProductionSchema = z.object({
  id: z.number(),
  titel: z.string(),
  ondertitel: z.string(),
  description1: z.string(),
  description2: z.string().nullable(),
  genre: z.string(),
  planning_id: z.number().nullable(),
  blog_titel: z.string().nullable(),
  blog_text: z.string().nullable(),
});
export const CreateProductionSchema = ProductionSchema.omit({id: true});
export const UpdateProductionSchema = ProductionSchema.partial();

/**
 * Schemas for events.
 */
export const EventSchema = z.object({
  id: z.number(),
  starttime: z.iso.datetime(),
  endtime: z.iso.datetime().nullable(),
  hall: z.string(),
  production_id: z.number(),
  price: z.number(),
});
export const UpdateEventSchema = EventSchema.partial();

// Type exports
export type Production = z.infer<typeof ProductionSchema>;
export type CreateProduction = z.infer<typeof CreateProductionSchema>;
export type UpdateProduction = z.infer<typeof UpdateProductionSchema>;
export type Event = z.infer<typeof EventSchema>;
export type UpdateEvent = z.infer<typeof UpdateEventSchema>;
