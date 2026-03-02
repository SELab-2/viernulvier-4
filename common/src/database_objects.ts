import { z } from "zod";

/**
 * Schemas for productions.
 */

// TODO add _EN and _NL fields in db for titel, ondertitel and descs?
export const ProductionSchema = z.object({
  id: z.number(),
  titel: z.string(),
  ondertitel: z.string(),
  description1: z.string(),
  description2: z.string().nullable(),
  planning_id: z.string().nullable(),
});

export const CreateProductionSchema = ProductionSchema.omit({ id: true });
export const UpdateProductionSchema = ProductionSchema.partial();

export const FilterProductionSchema = z.object({
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
});

/**
 * Schemas for events.
 */
export const EventSchema = z.object({
  id: z.number(),
  starttime: z.iso.datetime(),
  endtime: z.iso.datetime().nullable(),
  hall: z.string(),
  production_id: z.number(),
  price: z.number().nullable(),
});

export const CreateEventSchema = EventSchema.omit({ id: true });
export const UpdateEventSchema = EventSchema.partial();

export const FilterEventSchema = z.object({
  date: z.iso.date().optional(),
  date_between: z.iso.date().optional(),
  date_before: z.iso.date().optional(),
  date_after: z.iso.date().optional(),
  hall: z.string().optional(),
  id: z.coerce.number().optional(),
  production_id: z.coerce.number().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Schemas for blogs.
 */
// note: to get the blog from a prod or the other way around, use the api service with the id.
export const BlogSchema = z.object({
  id: z.number(),
  titel: z.string(),
  description: z.string(),
});

export const CreateBlogSchema = BlogSchema.omit({ id: true });
export const UpdateBlogSchema = BlogSchema.partial();

/**
 * Schemas for tags.
 */
export const TagSchema = z.object({
  id: z.number(),
  tag: z.string(),
});

export const CreateTagSchema = TagSchema.omit({ id: true });
export const UpdateTagSchema = TagSchema.partial();

// Type exports
export type Production = z.infer<typeof ProductionSchema>;
export type CreateProduction = z.infer<typeof CreateProductionSchema>;
export type UpdateProduction = z.infer<typeof UpdateProductionSchema>;
export type FilterProduction = z.infer<typeof FilterProductionSchema>;

export type Event = z.infer<typeof EventSchema>;
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export type UpdateEvent = z.infer<typeof UpdateEventSchema>;
export type FilterEvent = z.infer<typeof FilterEventSchema>;

export type Blog = z.infer<typeof BlogSchema>;
export type CreateBlog = z.infer<typeof CreateBlogSchema>;
export type UpdateBlog = z.infer<typeof UpdateBlogSchema>;

export type Tag = z.infer<typeof TagSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;
