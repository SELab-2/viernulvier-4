/**
 * Crops.
 */

import z from "zod";

// All names a CROP can have.
export const CROP_NAMES = [
  "hd_ready",
  "nb_ready",
  "FE3_header",
  "thumbnail",
  "og_image",
  "mobile",
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
