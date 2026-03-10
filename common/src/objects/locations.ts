import { z } from "zod";

export const LocationSchema = z.object({
  id: z.number(),
  location: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  legacy_id: z.string().nullable(),
});

export const CreateLocationSchema = LocationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateLocationSchema = LocationSchema.partial();

export type Location = z.infer<typeof LocationSchema>;
export type CreateLocation = z.infer<typeof CreateLocationSchema>;
export type UpdateLocation = z.infer<typeof UpdateLocationSchema>;
