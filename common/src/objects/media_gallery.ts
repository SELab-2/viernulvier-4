/**
 * Galleries.
 */

import z from "zod";

// enum for gallery type:
export const GALLERY_TYPES = ["main", "carousel"] as const;
export const GalleryTypeEnum = z.enum(GALLERY_TYPES);

// Base Gallery object.
export const MediaGallerySchema = z.object({
  id: z.number(),
  name: z.string(),
  type: GalleryTypeEnum,
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
export const ReplaceMediaGallerySchema = MutableMediaGallerySchema;

// Type exports.
export type MediaGallery = z.infer<typeof MediaGallerySchema>;
export type CreateMediaGallery = z.infer<typeof CreateMediaGallerySchema>;
export type ModifyMediaGallery = z.infer<typeof ModifyMediaGallerySchema>;
export type ReplaceMediaGallery = z.infer<typeof ReplaceMediaGallerySchema>;
export type GalleryType = z.infer<typeof GalleryTypeEnum>;
