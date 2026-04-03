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
  ModifyBlog,
  ModifyBlogSchema,
  ReplaceBlog,
  ReplaceBlogSchema,
  FilterBlog,
  FilterBlogSchema,
} from "./objects/blogs";
import {
  CreateEvent,
  CreateEventSchema,
  Event,
  EventSchema,
  FilterEvent,
  FilterEventSchema,
  ModifyEvent,
  ModifyEventSchema,
  ReplaceEvent,
  ReplaceEventSchema,
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
  ModifyPrice,
  ModifyPriceSchema,
  Price,
  PriceSchema,
  PriceView,
  PriceViewSchema,
  ReplacePrice,
  ReplacePriceSchema,
} from "./objects/prices";
import {
  CreateProduction,
  CreateProductionSchema,
  FilterProduction,
  FilterProductionSchema,
  ModifyProduction,
  ModifyProductionSchema,
  Production,
  ProductionSchema,
  ProductionView,
  ProductionViewSchema,
  ReplaceProduction,
  ReplaceProductionSchema,
} from "./objects/productions";
import {
  CreateTag,
  CreateTagSchema,
  ModifyTag,
  ModifyTagSchema,
  Tag,
  TagSchema,
  TagView,
  TagViewSchema,
} from "./objects/tags";
import {
  CreateMediaGallery,
  CreateMediaGallerySchema,
  GalleryType,
  GalleryTypeEnum,
  MediaGallery,
  MediaGallerySchema,
  ModifyMediaGallery,
  ModifyMediaGallerySchema,
  ReplaceMediaGallery,
  ReplaceMediaGallerySchema,
} from "./objects/media/media_gallery";
import {
  CreateMediaItem,
  CreateMediaItemSchema,
  ItemPosition,
  ItemPositionEnum,
  MediaItem,
  MediaItemSchema,
  MediaItemView,
  MediaItemViewSchema,
  ModifyMediaItem,
  ModifyMediaItemSchema,
  ReplaceMediaItem,
  ReplaceMediaItemSchema,
} from "./objects/media/media_item";
import {
  CreateMediaCrop,
  CreateMediaCropSchema,
  CropName,
  CropNameEnum,
  MediaCrop,
  MediaCropSchema,
  ModifyMediaCrop,
  ModifyMediaCropSchema,
  ReplaceMediaCrop,
  ReplaceMediaCropSchema,
} from "./objects/media/media_crop";

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
  FilterBlogSchema,

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

  // Media Schemas. (media_*.ts)
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
  GalleryTypeEnum,
  ReplaceMediaGallerySchema,
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
  FilterBlog,

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

  // Media Types. (media_*.ts)
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
  GalleryType,
  ReplaceMediaGallery,
};
