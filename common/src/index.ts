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
  ReplaceBlog,
  ReplaceBlogSchema,
  ModifyBlog,
  ModifyBlogSchema,
} from "./objects/blogs";
import {
  CreateEvent,
  CreateEventSchema,
  Event,
  EventSchema,
  FilterEvent,
  FilterEventSchema,
  ReplaceEvent,
  ReplaceEventSchema,
  ModifyEvent,
  ModifyEventSchema,
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
  ModifyLocation,
  ModifyLocationSchema,
} from "./objects/locations";
import {
  CreatePrice,
  CreatePriceSchema,
  Price,
  PriceSchema,
  PriceView,
  PriceViewSchema,
  ReplacePrice,
  ReplacePriceSchema,
  ModifyPrice,
  ModifyPriceSchema,
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
  ReplaceProduction,
  ReplaceProductionSchema,
  ModifyProduction,
  ModifyProductionSchema,
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
  ModifyProductionSchema,
  ReplaceProductionSchema,
  FilterProductionSchema,

  // Event Schemas.
  EventSchema,
  CreateEventSchema,
  ModifyEventSchema,
  ReplaceEventSchema,
  FilterEventSchema,

  // Blog Schemas.
  BlogSchema,
  BlogViewSchema,
  ModifyBlogSchema,
  CreateBlogSchema,
  ReplaceBlogSchema,

  // Tag Schemas.
  TagSchema,
  TagViewSchema,
  CreateTagSchema,
  UpdateTagSchema,

  // Location Schemas.
  LocationSchema,
  LocationViewSchema,
  CreateLocationSchema,
  ModifyLocationSchema,

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
  ModifyPriceSchema,
  ReplacePriceSchema,

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
  ModifyProduction,
  ReplaceProduction,
  FilterProduction,

  // Event Types.
  Event,
  CreateEvent,
  ModifyEvent,
  ReplaceEvent,
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
  ModifyBlog,
  ReplaceBlog,

  // Location Types.
  Location,
  LocationView,
  CreateLocation,
  ModifyLocation,

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
  ModifyPrice,
  ReplacePrice,

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
