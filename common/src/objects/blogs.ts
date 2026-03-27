import { z } from "zod";
import { LocalizedStringSchema } from "./language";

// Base Blog object.
export const BlogSchema = z.object({
  id: z.number(),
  titel: LocalizedStringSchema,
  description: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// Localized Blog object.
export const BlogViewSchema = BlogSchema.extend({
  titel: z.string(),
  description: z.string(),
});

// Omits read-only fields.
const MutableBlogSchema = BlogSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating & Creating.
export const CreateBlogSchema = MutableBlogSchema;
export const ModifyBlogSchema = MutableBlogSchema.partial();
export const ReplaceBlogSchema = MutableBlogSchema;

// Type exports.
export type Blog = z.infer<typeof BlogSchema>;
export type BlogView = z.infer<typeof BlogViewSchema>;
export type CreateBlog = z.infer<typeof CreateBlogSchema>;
export type ModifyBlog = z.infer<typeof ModifyBlogSchema>;
export type ReplaceBlog = z.infer<typeof ReplaceBlogSchema>;
