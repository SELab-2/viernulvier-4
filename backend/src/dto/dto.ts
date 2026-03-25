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
  PaginationFilterSchema,
  PriceSchema,
  PriceViewSchema,
  ProductionSchema,
  ProductionViewSchema,
  PublicAccountSchema,
  TagSchema,
  TagViewSchema,
  UpdateAccountSchema,
  UpdateBlogSchema,
  UpdatedMediaCropSchema,
  UpdatedMediaGallerySchema,
  UpdatedMediaItemSchema,
  UpdateEventSchema,
  UpdateLocationSchema,
  UpdatePriceSchema,
  UpdateProductionSchema,
  UpdateTagSchema,
  VerifyApiKeySchema,
} from "@repo/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
// This file wraps the Objects into an DTO Swagger can see.

// Production Wrappers
export class ProductionDto extends createZodDto(ProductionSchema) {}
export class ProductionViewDto extends createZodDto(ProductionViewSchema) {}
export class CreateProductionDto extends createZodDto(CreateProductionSchema) {}
export class UpdateProductionDto extends createZodDto(UpdateProductionSchema) {}
export class FilterProductionDto extends createZodDto(FilterProductionSchema) {}

// Event Wrappers
export class EventDto extends createZodDto(EventSchema) {}
export class CreateEventDto extends createZodDto(CreateEventSchema) {}
export class UpdateEventDto extends createZodDto(UpdateEventSchema) {}
export class FilterEventDto extends createZodDto(FilterEventSchema) {}

// Blog Wrappers
export class BlogDto extends createZodDto(BlogSchema) {}
export class BlogViewDto extends createZodDto(BlogViewSchema) {}
export class CreateBlogDto extends createZodDto(CreateBlogSchema) {}
export class UpdateBlogDto extends createZodDto(UpdateBlogSchema) {}

// Tag Wrappers
export class TagDto extends createZodDto(TagSchema) {}
export class TagViewDto extends createZodDto(TagViewSchema) {}
export class CreateTagDto extends createZodDto(CreateTagSchema) {}
export class UpdateTagDto extends createZodDto(UpdateTagSchema) {}

// Location Wrappers
export class LocationDto extends createZodDto(LocationSchema) {}
export class LocationViewDto extends createZodDto(LocationViewSchema) {}
export class CreateLocationDto extends createZodDto(CreateLocationSchema) {}
export class UpdateLocationDto extends createZodDto(UpdateLocationSchema) {}

// Price Wrappers
export class PriceDto extends createZodDto(PriceSchema) {}
export class PriceViewDto extends createZodDto(PriceViewSchema) {}
export class CreatePriceDto extends createZodDto(CreatePriceSchema) {}
export class UpdatePriceDto extends createZodDto(UpdatePriceSchema) {}

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
export class UpdateMediaGalleryDto extends createZodDto(
  UpdatedMediaGallerySchema,
) {}
export class MediaItemDto extends createZodDto(MediaItemSchema) {}
export class CreateMediaItemDto extends createZodDto(CreateMediaItemSchema) {}
export class UpdateMediaItemDto extends createZodDto(UpdatedMediaItemSchema) {}
export class MediaCropDto extends createZodDto(MediaCropSchema) {}
export class CreateMediaCropDto extends createZodDto(CreateMediaCropSchema) {}
export class UpdateMediaCropDto extends createZodDto(UpdatedMediaCropSchema) {}

// CSV Upload DTO
export class ParserUploadCsvBodyDto {
  @ApiProperty({ type: "string", format: "binary" })
  file?: unknown;

  @ApiPropertyOptional({
    description:
      "Optional fallback path on the server when no multipart file is uploaded.",
  })
  filePath?: string;
}
