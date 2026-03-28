import z from "zod";
import { LocalizedStringSchema } from "./language";

/**
 * Galleries.
 */

// Base Gallery object.
export const MediaGallerySchema = z.object({
  id: z.number(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// Omits read-only fields.
const MutableMediaGallerySchema = MediaGallerySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating & Creating.
export const CreateMediaGallerySchema = MutableMediaGallerySchema;
export const ModifyMediaGallerySchema = MutableMediaGallerySchema.partial();

// Type exports.
export type MediaGallery = z.infer<typeof MediaGallerySchema>;
export type CreateMediaGallery = z.infer<typeof CreateMediaGallerySchema>;
export type ModifyMediaGallery = z.infer<typeof ModifyMediaGallerySchema>;

/**
 * Items.
 */

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

/**
 * Crops.
 */

// All names a CROP can have.
export const CROP_NAMES = [
  "hd_ready",
  "hd_ready_square",
  "hd_ready_portrait",
  "FE3_header",
  "FE3_2by1",
  "FE3_grid",
] as const;
export const CropNameEnum = z.enum(CROP_NAMES);

// Base Crop object.
export const MediaCropSchema = z.object({
  id: z.number(),
  name: CropNameEnum,
  url: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// Omits read-only fields.
const MutableMediaCropSchema = MediaCropSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Updating & Creating.
export const CreateMediaCropSchema = MutableMediaCropSchema.extend({
  // The item this crop is supposed to be linked to.
  item_id: z.number().int().positive(),
});
export const ModifyMediaCropSchema = MutableMediaCropSchema.partial();
export const ReplaceMediaCropSchema = MutableMediaCropSchema;

// Type exports.
export type MediaCrop = z.infer<typeof MediaCropSchema>;
export type CreateMediaCrop = z.infer<typeof CreateMediaCropSchema>;
export type ModifyMediaCrop = z.infer<typeof ModifyMediaCropSchema>;
export type ReplaceMediaCrop = z.infer<typeof ReplaceMediaCropSchema>;
export type CropName = z.infer<typeof CropNameEnum>;
export type ItemPosition = z.infer<typeof ItemPositionEnum>;
