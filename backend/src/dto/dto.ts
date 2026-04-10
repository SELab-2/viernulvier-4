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
  ModifyBlogSchema,
  ModifyEventSchema,
  ModifyLocationSchema,
  ModifyMediaCropSchema,
  ModifyMediaGallerySchema,
  ModifyMediaItemSchema,
  ModifyPriceSchema,
  ModifyProductionSchema,
  ModifyTagSchema,
  PaginationFilterSchema,
  PriceSchema,
  PriceViewSchema,
  PrintItemSchema,
  PrintItemViewSchema,
  CreatePrintItemSchema,
  ModifyPrintItemSchema,
  ReplacePrintItemSchema,
  ProductionSchema,
  ProductionViewSchema,
  PublicAccountSchema,
  ReplaceBlogSchema,
  ReplaceEventSchema,
  ReplaceMediaCropSchema,
  ReplaceMediaGallerySchema,
  ReplaceMediaItemSchema,
  ReplacePriceSchema,
  ReplaceProductionSchema,
  TagSchema,
  TagViewSchema,
  UpdateAccountSchema,
  VerifyApiKeySchema,
  FilterBlogSchema,
  AccountSchema,
} from "@repo/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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
export class FilterBlogDto extends createZodDto(FilterBlogSchema) {}

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
export class AccountDto extends createZodDto(AccountSchema) {}

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
export class ReplaceMediaGalleryDto extends createZodDto(
  ReplaceMediaGallerySchema,
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

// Prints
export class PrintItemDto extends createZodDto(PrintItemSchema) {}
export class PrintItemViewDto extends createZodDto(PrintItemViewSchema) {}
export class CreatePrintItemDto extends createZodDto(CreatePrintItemSchema) {}
export class ModifyPrintItemDto extends createZodDto(ModifyPrintItemSchema) {}
export class ReplacePrintItemDto extends createZodDto(ReplacePrintItemSchema) {}

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
