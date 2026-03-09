import { z } from "zod";

/**
 * Languages
 */

// If you want to add languages you can do so here.
export const SUPPORTED_LANGUAGES = ["en", "nl"] as const;
export const LanguageEnum = z.enum(SUPPORTED_LANGUAGES);
export const LanguageQuerySchema = z.object({
  lang: LanguageEnum.default("nl").describe(
    "The language code for the content.",
  ),
});
export const DEFAULT_LANGUAGE: Language = "nl";

// These allow us to have schemas inside of schemas for localization.
export const LocalizedStringSchema = z.record(LanguageEnum, z.string());
export const LocalizedStringNullableSchema = z
  .record(LanguageEnum, z.string())
  .nullable();

/**
 * Schemas for productions.
 */

export const ProductionSchema = z.object({
  id: z.number(),
  titel: LocalizedStringSchema,
  description1: LocalizedStringSchema,
  description2: LocalizedStringNullableSchema,
  artist: LocalizedStringNullableSchema,
  tagline: LocalizedStringNullableSchema,
  credits: LocalizedStringNullableSchema,
  performer_type: z.string().nullable(),
  attendance_mode: z.string().nullable(),
  created_at: z.iso.datetime().nullable(), // TODO remove nullable when update csv parser bcs otherwise doesnt work.
  updated_at: z.iso.datetime().nullable(), // TODO here too.
  legacy_id: z.string().nullable(),
});
export const ProductionViewSchema = ProductionSchema.extend({
  titel: z.string(),
  description1: z.string(),
  description2: z.string(),
  tagline: z.string().nullable(),
  credits: z.string().nullable(),
});
export const CreateProductionSchema = ProductionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateProductionSchema = ProductionSchema.partial();

export const FilterProductionSchema = z.object({
  lang: LanguageEnum.optional(),
  titel: z.string().optional(),
  id: z.coerce.number().optional(),
  tag_ids: z
    .union([z.coerce.number(), z.array(z.coerce.number())])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (Array.isArray(val)) return val;
      return [val];
    }),
  hall: z.string().optional(),
  date: z.iso.date().optional(),
  date_between: z.iso.date().optional(),
  date_before: z.iso.date().optional(),
  date_after: z.iso.date().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(20),
  artist: z.string().optional(),
  performer_type: z.string().optional(),
  attendance_mode: z.string().optional(),
});

/**
 * Schemas for events.
 */
export const EventSchema = z.object({
  id: z.number(),
  starttime: z.iso.datetime(),
  endtime: z.iso.datetime().nullable(),
  doors_at: z.iso.datetime().nullable(),
  intermission_at: z.iso.datetime().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  production_id: z.number(),
  legacy_id: z.string().nullable(),
});

export const CreateEventSchema = EventSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateEventSchema = EventSchema.partial();

/**
 * Schemas for locations.
 */
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

export const FilterEventSchema = z.object({
  date: z.iso.date().optional(),
  date_between: z.iso.date().optional(),
  date_before: z.iso.date().optional(),
  date_after: z.iso.date().optional(),
  id: z.coerce.number().optional(),
  production_id: z.coerce.number().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Schemas for blogs.
 */
export const PriceSchema = z.object({
  id: z.number(),
  price: z.float32(),
  name: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  legacy_id: z.string().nullable(),
});
export const CreatePriceSchema = PriceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdatePriceSchema = PriceSchema.partial();

/**
 * Schemas for blogs.
 */
// note: to get the blog from a prod or the other way around, use the api service with the id.
export const BlogSchema = z.object({
  id: z.number(),
  titel: z.string(),
  description: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const CreateBlogSchema = BlogSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateBlogSchema = BlogSchema.partial();

/**
 * Schemas for tags.
 */
export const TagSchema = z.object({
  id: z.number(),
  tag: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  legacy_id: z.string().nullable(),
});

export const CreateTagSchema = TagSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const UpdateTagSchema = TagSchema.partial();

/**
 * Schemas for accounts.
 */
export const AccountSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  superAdmin: z.boolean(),
});

export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  superAdmin: true,
});
export const UpdateAccountSchema = AccountSchema.partial();
export const PublicAccountSchema = AccountSchema.omit({
  password: true,
  superAdmin: true,
}); // don't leak these. (note: still contains your id so you can still get your api key through that.)

/**
 * Schemas for api-keys.
 * note: you never update an api key and api keys are generated in backend, so no need for Create or Update types.
 */
export const ApiKeySchema = z.object({
  key: z.string(), // strings are unique.
  id: z.number(), // id is here for the join-table operations.
});
export const VerifyApiKeySchema = ApiKeySchema.omit({ id: true });

/**
 * Shared filters.
 */
export const PaginationFilterSchema = z.object({
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(0).max(100).default(20),
});

/**
 * Type Exports
 */

export type Production = z.infer<typeof ProductionSchema>;
export type ProductionView = z.infer<typeof ProductionViewSchema>;
export type CreateProduction = z.infer<typeof CreateProductionSchema>;
export type UpdateProduction = z.infer<typeof UpdateProductionSchema>;
export type FilterProduction = z.infer<typeof FilterProductionSchema>;

export type Event = z.infer<typeof EventSchema>;
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export type UpdateEvent = z.infer<typeof UpdateEventSchema>;
export type FilterEvent = z.infer<typeof FilterEventSchema>;

export type Price = z.infer<typeof PriceSchema>;
export type CreatePrice = z.infer<typeof CreatePriceSchema>;
export type UpdatePrice = z.infer<typeof UpdatePriceSchema>;

export type Blog = z.infer<typeof BlogSchema>;
export type CreateBlog = z.infer<typeof CreateBlogSchema>;
export type UpdateBlog = z.infer<typeof UpdateBlogSchema>;

export type Tag = z.infer<typeof TagSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;

export type Location = z.infer<typeof LocationSchema>;
export type CreateLocation = z.infer<typeof CreateLocationSchema>;
export type UpdateLocation = z.infer<typeof UpdateLocationSchema>;

export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
export type PublicAccount = z.infer<typeof PublicAccountSchema>;

export type ApiKey = z.infer<typeof ApiKeySchema>;
export type VerifyApiKey = z.infer<typeof VerifyApiKeySchema>;

export type PaginationFilter = z.infer<typeof PaginationFilterSchema>;

export type Language = z.infer<typeof LanguageEnum>;
export type LanguageQuery = z.infer<typeof LanguageQuerySchema>;
