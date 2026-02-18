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

// event object
export const EventSchema = z.object({
  id: z.number(),
  starttime: z.iso.datetime(),
  endtime: z.iso.datetime().nullable(),
  hall: z.string(),
  production_id: z.number(),
  price: z.number(),
});

// export
export type ProductionSchema = z.infer<typeof ProductionSchema>;
export type EventSchema = z.infer<typeof EventSchema>;
