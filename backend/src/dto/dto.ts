import {
  ApiKeySchema,
  BlogSchema,
  BlogViewSchema,
  CreateAccountSchema,
  CreateBlogSchema,
  CreateEventSchema,
  CreateLocationSchema,
  CreateMediaCropSchema,
  CreateMediaGallerySchema,
  CreateMediaItemSchema,
  CreatePriceSchema,
  CreateProductionSchema,
  CreateTagSchema,
  EventSchema,
  FilterEventSchema,
  FilterProductionSchema,
  LanguageQuerySchema,
  LocationSchema,
  LocationViewSchema,
  MediaCropSchema,
  MediaGallerySchema,
  MediaItemSchema,
  MediaItemViewSchema,
  PaginationFilterSchema,
  PriceSchema,
  PriceViewSchema,
  ProductionSchema,
  ProductionViewSchema,
  PublicAccountSchema,
  ReplaceBlogSchema,
  TagSchema,
  TagViewSchema,
  UpdateAccountSchema,
  ModifyBlogSchema,
  ModifyEventSchema,
  ModifyLocationSchema,
  ModifyPriceSchema,
  ModifyProductionSchema,
  ModifyTagSchema,
  VerifyApiKeySchema,
  ReplaceEventSchema,
  ReplacePriceSchema,
  ReplaceProductionSchema,
  ModifyMediaItemSchema,
  ModifyMediaCropSchema,
  ModifyMediaGallerySchema,
  ReplaceMediaCropSchema,
  ReplaceMediaItemSchema,
} from "@repo/common";
import { createZodDto } from "nestjs-zod";
// This file wraps the Objects into an DTO Swagger can see.

// Production Wrappers
export class ProductionDto extends createZodDto(ProductionSchema) {}
export class ProductionViewDto extends createZodDto(ProductionViewSchema) {}
export class CreateProductionDto extends createZodDto(CreateProductionSchema) {}
export class ModifyProductionDto extends createZodDto(ModifyProductionSchema) {}
export class ReplaceProductionDto extends createZodDto(
  ReplaceProductionSchema,
) {}
export class FilterProductionDto extends createZodDto(FilterProductionSchema) {}

// Event Wrappers
export class EventDto extends createZodDto(EventSchema) {}
export class CreateEventDto extends createZodDto(CreateEventSchema) {}
export class ModifyEventDto extends createZodDto(ModifyEventSchema) {}
export class ReplaceEventDto extends createZodDto(ReplaceEventSchema) {}
export class FilterEventDto extends createZodDto(FilterEventSchema) {}

// Blog Wrappers
export class BlogDto extends createZodDto(BlogSchema) {}
export class BlogViewDto extends createZodDto(BlogViewSchema) {}
export class CreateBlogDto extends createZodDto(CreateBlogSchema) {}
export class ModifyBlogDto extends createZodDto(ModifyBlogSchema) {}
export class ReplaceBlogDto extends createZodDto(ReplaceBlogSchema) {}

// Tag Wrappers
export class TagDto extends createZodDto(TagSchema) {}
export class TagViewDto extends createZodDto(TagViewSchema) {}
export class CreateTagDto extends createZodDto(CreateTagSchema) {}
export class ModifyTagDto extends createZodDto(ModifyTagSchema) {}

// Location Wrappers
export class LocationDto extends createZodDto(LocationSchema) {}
export class LocationViewDto extends createZodDto(LocationViewSchema) {}
export class CreateLocationDto extends createZodDto(CreateLocationSchema) {}
export class ModifyLocationDto extends createZodDto(ModifyLocationSchema) {}

// Price Wrappers
export class PriceDto extends createZodDto(PriceSchema) {}
export class PriceViewDto extends createZodDto(PriceViewSchema) {}
export class CreatePriceDto extends createZodDto(CreatePriceSchema) {}
export class ModifyPriceDto extends createZodDto(ModifyPriceSchema) {}
export class ReplacePriceDto extends createZodDto(ReplacePriceSchema) {}

// Account Wrapper
export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}
export class UpdateAccountDto extends createZodDto(UpdateAccountSchema) {}
export class PublicAccountDto extends createZodDto(PublicAccountSchema) {}

// API keys Wrapper
export class ApiKeyDto extends createZodDto(ApiKeySchema) {}
export class VerifyApiKeyDto extends createZodDto(VerifyApiKeySchema) {}

// Generic Pagination Filter and Response Wrapper
export class PaginationFilterDto extends createZodDto(PaginationFilterSchema) {}

// Language
export class LanguageQueryDto extends createZodDto(LanguageQuerySchema) {}

// Media
export class MediaGalleryDto extends createZodDto(MediaGallerySchema) {}
export class CreateMediaGalleryDto extends createZodDto(
  CreateMediaGallerySchema,
) {}
export class ModifyMediaGalleryDto extends createZodDto(
  ModifyMediaGallerySchema,
) {}
export class MediaItemDto extends createZodDto(MediaItemSchema) {}
export class MediaItemViewDto extends createZodDto(MediaItemViewSchema) {}
export class CreateMediaItemDto extends createZodDto(CreateMediaItemSchema) {}
export class ModifyMediaItemDto extends createZodDto(ModifyMediaItemSchema) {}
export class ReplaceMediaItemDto extends createZodDto(ReplaceMediaItemSchema) {}
export class MediaCropDto extends createZodDto(MediaCropSchema) {}
export class CreateMediaCropDto extends createZodDto(CreateMediaCropSchema) {}
export class ModifyMediaCropDto extends createZodDto(ModifyMediaCropSchema) {}
export class ReplaceMediaCropDto extends createZodDto(ReplaceMediaCropSchema) {}
