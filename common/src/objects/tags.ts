import { z } from "zod";
import { LocalizedStringSchema } from "./language";

// Base Tag object.
export const TagSchema = z.object({
  id: z.number(),
  tag: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  // Legacy ID is omitted here because the API doesn't use it.
});

// Localized Tag object.
export const TagViewSchema = TagSchema.extend({
  tag: z.string(),
});

// Omits read-only fields.
const MutableTagSchema = TagSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating & Creating
export const CreateTagSchema = MutableTagSchema;
export const ModifyTagSchema = MutableTagSchema.partial();

// Type exports.
export type Tag = z.infer<typeof TagSchema>;
export type TagView = z.infer<typeof TagViewSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type ModifyTag = z.infer<typeof ModifyTagSchema>;
