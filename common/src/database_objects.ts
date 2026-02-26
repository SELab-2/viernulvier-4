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
  genre: z.string(),
  planning_id: z.number().nullable(),
});

export const CreateProductionSchema = ProductionSchema.omit({ id: true });
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

export const CreateEventSchema = EventSchema.omit({ id: true });
export const UpdateEventSchema = EventSchema.partial();

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

/**
 * Schemas for accounts.
 */
export const AccountSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(), // TODO discuss
  key: z.string(),
  super_admin: z.boolean(),
});

export const CreateAccountSchema = AccountSchema.omit({ id: true });
export const UpdateAccountSchema = AccountSchema.partial();

// Type exports
export type Production = z.infer<typeof ProductionSchema>;
export type CreateProduction = z.infer<typeof CreateProductionSchema>;
export type UpdateProduction = z.infer<typeof UpdateProductionSchema>;

export type Event = z.infer<typeof EventSchema>;
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export type UpdateEvent = z.infer<typeof UpdateEventSchema>;

export type Blog = z.infer<typeof BlogSchema>;
export type CreateBlog = z.infer<typeof CreateBlogSchema>;
export type UpdateBlog = z.infer<typeof UpdateBlogSchema>;

export type Tag = z.infer<typeof TagSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;

export type Account = z.infer<typeof AccountSchema>;
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
