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
  ModifyTag,
  ModifyTagSchema,
} from "./objects/tags";
import {
  CreateMediaCrop,
  CreateMediaCropSchema,
  CreateMediaGallery,
  CreateMediaGallerySchema,
  CreateMediaItem,
  CreateMediaItemSchema,
  CropName,
  CropNameEnum,
  ItemPosition,
  ItemPositionEnum,
  MediaCrop,
  MediaCropSchema,
  MediaGallery,
  MediaGallerySchema,
  MediaItem,
  MediaItemSchema,
  MediaItemView,
  MediaItemViewSchema,
  ModifyMediaCrop,
  ModifyMediaCropSchema,
  ModifyMediaGallery,
  ModifyMediaGallerySchema,
  ModifyMediaItem,
  ModifyMediaItemSchema,
  ReplaceMediaCrop,
  ReplaceMediaCropSchema,
  ReplaceMediaItem,
  ReplaceMediaItemSchema,
} from "./objects/media";

// list of all exports: (this way only need to import this file.)
export {
  // Production Schemas. (production.ts)
  ProductionSchema,
  ProductionViewSchema,
  CreateProductionSchema,
  ModifyProductionSchema,
  ReplaceProductionSchema,
  FilterProductionSchema,

  // Event Schemas. (events.ts)
  EventSchema,
  CreateEventSchema,
  ModifyEventSchema,
  ReplaceEventSchema,
  FilterEventSchema,

  // Blog Schemas. (blogs.ts)
  BlogSchema,
  BlogViewSchema,
  ModifyBlogSchema,
  CreateBlogSchema,
  ReplaceBlogSchema,

  // Tag Schemas. (tags.ts)
  TagSchema,
  TagViewSchema,
  CreateTagSchema,
  ModifyTagSchema,

  // Location Schemas. (locations.ts)
  LocationSchema,
  LocationViewSchema,
  CreateLocationSchema,
  ModifyLocationSchema,

  // Auth Schemas. (accounts.ts + api.keys.ts)
  CreateAccountSchema,
  PublicAccountSchema,
  UpdateAccountSchema,
  ApiKeySchema,
  VerifyApiKeySchema,

  // Price Schemas. (prices.ts)
  PriceSchema,
  PriceViewSchema,
  CreatePriceSchema,
  ModifyPriceSchema,
  ReplacePriceSchema,

  // Pagination Schemas. (pagination.ts)
  PaginationFilterSchema,

  // Language Schemas. (language.ts)
  LanguageQuerySchema,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,

  // Media Schemas. (media.ts)
  MediaGallerySchema,
  MediaItemSchema,
  MediaItemViewSchema,
  MediaCropSchema,
  CreateMediaCropSchema,
  CreateMediaGallerySchema,
  CreateMediaItemSchema,
  ModifyMediaCropSchema,
  ModifyMediaItemSchema,
  ModifyMediaGallerySchema,
  ReplaceMediaCropSchema,
  ReplaceMediaItemSchema,
  CropNameEnum,
  ItemPositionEnum,
};
export type {
  // Production Types. (productions.ts)
  Production,
  ProductionView,
  CreateProduction,
  ModifyProduction,
  ReplaceProduction,
  FilterProduction,

  // Event Types. (events.ts)
  Event,
  CreateEvent,
  ModifyEvent,
  ReplaceEvent,
  FilterEvent,

  // Tag Types. (tags.ts)
  Tag,
  TagView,
  CreateTag,
  ModifyTag,

  // Blog Types. (blogs.ts)
  Blog,
  BlogView,
  CreateBlog,
  ModifyBlog,
  ReplaceBlog,

  // Location Types. (locations.ts)
  Location,
  LocationView,
  CreateLocation,
  ModifyLocation,

  // Auth Types. (accounts.ts + api.keys.ts)
  UpdateAccount,
  PublicAccount,
  CreateAccount,
  ApiKey,
  VerifyApiKey,

  // Price Types. (prices.ts)
  Price,
  PriceView,
  CreatePrice,
  ModifyPrice,
  ReplacePrice,

  // Pagination Types. (pagination.ts)
  PaginationFilter,
  PaginatedResponse, // This has no schema because it doesn't need one.

  // Language Types. (language.ts)
  Language,
  LanguageQuery,

  // Media Types. (media.ts)
  MediaGallery,
  MediaItem,
  MediaItemView,
  MediaCrop,
  CreateMediaCrop,
  CreateMediaGallery,
  CreateMediaItem,
  ModifyMediaItem,
  ModifyMediaGallery,
  ModifyMediaCrop,
  ReplaceMediaCrop,
  ReplaceMediaItem,
  CropName,
  ItemPosition,
};
