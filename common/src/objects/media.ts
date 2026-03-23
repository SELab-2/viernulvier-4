import z from "zod";
import { LocalizedStringSchema } from "./language";

// enums
export const CROP_NAMES = [
  "hd_ready",
  "nb_ready",
  "FE3_header",
  "thumbnail",
  "og_image",
  "mobile",
] as const;
export const CropNameEnum = z.enum(CROP_NAMES);
export const ITEM_POSITIONS = ["main", "carousel"] as const;
export const ItemPositionEnum = z.enum(ITEM_POSITIONS);

export type CropName = z.infer<typeof CropNameEnum>;
export type ItemPosition = z.infer<typeof ItemPositionEnum>;

// Gallery
export const MediaGallerySchema = z.object({
  id: z.number(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});
export const CreateMediaGallerySchema = MediaGallerySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdatedMediaGallerySchema = MediaGallerySchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type MediaGallery = z.infer<typeof MediaGallerySchema>;
export type CreateMediaGallery = z.infer<typeof CreateMediaGallerySchema>;
export type UpdatedMediaGallery = z.infer<typeof UpdatedMediaGallerySchema>;

// item
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
export const MediaItemViewSchema = MediaItemSchema.extend({
  title: z.string(),
  description: z.string(),
  credits: z.string(),
});

export const CreateMediaItemSchema = MediaItemSchema.extend({
  // An array of gallery ids to link to on creation.
  gallery_ids: z.array(z.number().int().positive()).optional(),
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdatedMediaItemSchema = MediaItemSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type MediaItem = z.infer<typeof MediaItemSchema>;
export type MediaItemView = z.infer<typeof MediaItemViewSchema>;
export type CreateMediaItem = z.infer<typeof CreateMediaItemSchema>;
export type UpdatedMediaItem = z.infer<typeof UpdatedMediaItemSchema>;

// crop
export const MediaCropSchema = z.object({
  id: z.number(),
  name: CropNameEnum,
  url: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});
export const CreateMediaCropSchema = MediaCropSchema.extend({
  // The item this crop is supposed to be linked to.
  item_id: z.number().int().positive(),
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdatedMediaCropSchema = MediaCropSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type MediaCrop = z.infer<typeof MediaCropSchema>;
export type CreateMediaCrop = z.infer<typeof CreateMediaCropSchema>;
export type UpdatedMediaCrop = z.infer<typeof UpdatedMediaCropSchema>;
