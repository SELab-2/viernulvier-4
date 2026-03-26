import {
  CreateAccount,
  CreateAccountSchema,
  PublicAccount,
  PublicAccountSchema,
  UpdateAccount,
  UpdateAccountSchema,
} from "./objects/accounts";
import {
  ApiKey,
  ApiKeySchema,
  VerifyApiKey,
  VerifyApiKeySchema,
} from "./objects/api.keys";
import {
  Blog,
  BlogSchema,
  BlogView,
  BlogViewSchema,
  CreateBlog,
  CreateBlogSchema,
  UpdateBlog,
  UpdateBlogSchema,
} from "./objects/blogs";
import {
  CreateEvent,
  CreateEventSchema,
  Event,
  EventSchema,
  FilterEvent,
  FilterEventSchema,
  UpdateEvent,
  UpdateEventSchema,
} from "./objects/events";
import {
  PaginatedResponse,
  PaginationFilter,
  PaginationFilterSchema,
} from "./objects/pagination";
import {
  DEFAULT_LANGUAGE,
  Language,
  LanguageQuery,
  LanguageQuerySchema,
  SUPPORTED_LANGUAGES,
} from "./objects/language";
import {
  CreateLocation,
  CreateLocationSchema,
  Location,
  LocationSchema,
  LocationView,
  LocationViewSchema,
  UpdateLocation,
  UpdateLocationSchema,
} from "./objects/locations";
import {
  CreatePrice,
  CreatePriceSchema,
  Price,
  PriceSchema,
  PriceView,
  PriceViewSchema,
  UpdatePrice,
  UpdatePriceSchema,
} from "./objects/prices";
import {
  CreateProduction,
  CreateProductionSchema,
  FilterProduction,
  FilterProductionSchema,
  Production,
  ProductionSchema,
  ProductionView,
  ProductionViewSchema,
  UpdateProduction,
  UpdateProductionSchema,
} from "./objects/productions";
import {
  CreateTag,
  CreateTagSchema,
  Tag,
  TagSchema,
  TagView,
  TagViewSchema,
  UpdateTag,
  UpdateTagSchema,
} from "./objects/tags";
import {
  CreateMediaCrop,
  CreateMediaCropSchema,
  CreateMediaGallery,
  CreateMediaGallerySchema,
  CreateMediaItem,
  CreateMediaItemSchema,
  MediaCrop,
  MediaCropSchema,
  MediaGallery,
  MediaGallerySchema,
  MediaItem,
  MediaItemSchema,
  UpdatedMediaCrop,
  UpdatedMediaCropSchema,
  UpdatedMediaGallery,
  UpdatedMediaGallerySchema,
  UpdatedMediaItem,
  UpdatedMediaItemSchema,
} from "./objects/media";

// list of all exports: (this way only need to import this file.)
export {
  // Production Schemas.
  ProductionSchema,
  ProductionViewSchema,
  CreateProductionSchema,
  UpdateProductionSchema,
  FilterProductionSchema,

  // Event Schemas.
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  FilterEventSchema,

  // Blog Schemas.
  BlogSchema,
  BlogViewSchema,
  UpdateBlogSchema,
  CreateBlogSchema,

  // Tag Schemas.
  TagSchema,
  TagViewSchema,
  CreateTagSchema,
  UpdateTagSchema,

  // Location Schemas.
  LocationSchema,
  LocationViewSchema,
  CreateLocationSchema,
  UpdateLocationSchema,

  // Auth Schemas.
  CreateAccountSchema,
  PublicAccountSchema,
  UpdateAccountSchema,
  ApiKeySchema,
  VerifyApiKeySchema,

  // Price Schemas.
  PriceSchema,
  PriceViewSchema,
  CreatePriceSchema,
  UpdatePriceSchema,

  // Pagination Schemas.
  PaginationFilterSchema,

  // Language Schemas.
  LanguageQuerySchema,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,

  // Media Schemas.
  MediaGallerySchema,
  MediaItemSchema,
  MediaCropSchema,
  CreateMediaCropSchema,
  CreateMediaGallerySchema,
  CreateMediaItemSchema,
  UpdatedMediaCropSchema,
  UpdatedMediaItemSchema,
  UpdatedMediaGallerySchema,
};
export type {
  // Production Types.
  Production,
  ProductionView,
  CreateProduction,
  UpdateProduction,
  FilterProduction,

  // Event Types.
  Event,
  CreateEvent,
  UpdateEvent,
  FilterEvent,

  // Tag Types.
  Tag,
  TagView,
  CreateTag,
  UpdateTag,

  // Blog Types.
  Blog,
  BlogView,
  CreateBlog,
  UpdateBlog,

  // Location Types.
  Location,
  LocationView,
  CreateLocation,
  UpdateLocation,

  // Auth Types.
  UpdateAccount,
  PublicAccount,
  CreateAccount,
  ApiKey,
  VerifyApiKey,

  // Price Types.
  Price,
  PriceView,
  CreatePrice,
  UpdatePrice,

  // Pagination Types.
  PaginationFilter,
  PaginatedResponse, // This has no schema because it doesn't need one.

  // Language Types.
  Language,
  LanguageQuery,

  // Media Types.
  MediaGallery,
  MediaItem,
  MediaCrop,
  CreateMediaCrop,
  CreateMediaGallery,
  CreateMediaItem,
  UpdatedMediaItem,
  UpdatedMediaGallery,
  UpdatedMediaCrop,
};
