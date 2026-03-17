import { z } from "zod";
import { LocalizedStringSchema } from "./language";

export const TagSchema = z.object({
  id: z.number(),
  tag: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  // Legacy ID is omitted here because the API doesn't use it.
});
export const TagViewSchema = TagSchema.extend({
  tag: z.string(),
});

export const CreateTagSchema = TagSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateTagSchema = TagSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Tag = z.infer<typeof TagSchema>;
export type TagView = z.infer<typeof TagViewSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;
