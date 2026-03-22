import z from "zod";

// Gallery
export const MediaGallerySchema = z.object({
  id: z.number(),
  name: z.string(), // TODO this needs language?
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
export type UpdateMediaGallery = z.infer<typeof UpdatedMediaGallerySchema>;

// item
export const MediaItemSchema = z.object({
  id: z.number(),
  type: z.string(),
  original_filename: z.string(),
  position: z.number(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
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
export type UpdateMediaItem = z.infer<typeof UpdatedMediaItemSchema>;

// crop
export const MediaCropSchema = z.object({
  id: z.number(),
  name: z.string(), // TODO this needs language?
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
export type UpdateMediaCrop = z.infer<typeof UpdatedMediaCropSchema>;
