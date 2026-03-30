/**
 * Items.
 */

import z from "zod";
import { LocalizedStringSchema } from "../language";

// All positions an ITEM can be in.
export const ITEM_POSITIONS = ["main", "carousel"] as const;
export const ItemPositionEnum = z.enum(ITEM_POSITIONS);

// Base Item object.
export const MediaItemSchema = z.object({
  id: z.number(),
  type: z.string(),
  original_filename: z.string(),
  position: ItemPositionEnum,
  width: z.number(),
  height: z.number(),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema,
  credits: LocalizedStringSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// Localized Item object.
export const MediaItemViewSchema = MediaItemSchema.extend({
  title: z.string(),
  description: z.string(),
  credits: z.string(),
});

const MutableMediaItemSchema = MediaItemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating and creating.
export const CreateMediaItemSchema = MutableMediaItemSchema.extend({
  // An array of gallery ids to link to on creation.
  gallery_ids: z.array(z.number().int().positive()).optional(),
});
export const ModifyMediaItemSchema = MutableMediaItemSchema.partial();
export const ReplaceMediaItemSchema = MutableMediaItemSchema;

// Type exports.
export type MediaItem = z.infer<typeof MediaItemSchema>;
export type MediaItemView = z.infer<typeof MediaItemViewSchema>;
export type CreateMediaItem = z.infer<typeof CreateMediaItemSchema>;
export type ModifyMediaItem = z.infer<typeof ModifyMediaItemSchema>;
export type ReplaceMediaItem = z.infer<typeof ReplaceMediaItemSchema>;
export type ItemPosition = z.infer<typeof ItemPositionEnum>;
