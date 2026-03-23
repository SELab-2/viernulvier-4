import z from "zod";
import { LocalizedStringSchema } from "./language";

// enums
export const CROP_NAMES = [] as const;
export const CropNameEnum = z.enum(CROP_NAMES);
export const ITEM_POSITIONS = ["main", "carousel"] as const;
export const ItemPositionEnum = z.enum(ITEM_POSITIONS);

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
export const CreateMediaItemSchema = MediaItemSchema.omit({
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
export const CreateMediaCropSchema = MediaCropSchema.omit({
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
