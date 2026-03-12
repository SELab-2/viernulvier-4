import { z } from "zod";
import { LocalizedStringSchema } from "./language";

export const BlogSchema = z.object({
  id: z.number(),
  titel: LocalizedStringSchema,
  description: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});
export const BlogViewSchema = BlogSchema.extend({
  titel: z.string(),
  description: z.string(),
});

export const CreateBlogSchema = BlogSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateBlogSchema = BlogSchema.partial();

export type Blog = z.infer<typeof BlogSchema>;
export type BlogView = z.infer<typeof BlogViewSchema>;
export type CreateBlog = z.infer<typeof CreateBlogSchema>;
export type UpdateBlog = z.infer<typeof UpdateBlogSchema>;
