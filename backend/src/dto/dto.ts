import {
  ApiKeySchema,
  BlogSchema,
  BlogViewSchema,
  CreateAccountSchema,
  CreateBlogSchema,
  CreateEventSchema,
  CreateLocationSchema,
  CreatePriceSchema,
  CreateProductionSchema,
  CreateTagSchema,
  EventSchema,
  FilterEventSchema,
  FilterProductionSchema,
  LanguageQuerySchema,
  LocationSchema,
  LocationViewSchema,
  PaginatedResponseSchema,
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
  UpdateEventSchema,
  UpdateLocationSchema,
  UpdatePriceSchema,
  UpdateProductionSchema,
  UpdateTagSchema,
  VerifyApiKeySchema,
} from "@repo/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
// This file wraps the Objects into an DTO Swagger can see.

// Production Wrappers
export class ProductionDto extends createZodDto(ProductionSchema) {}
export class ProductionViewDto extends createZodDto(ProductionViewSchema) {}
export class CreateProductionDto extends createZodDto(CreateProductionSchema) {}
export class UpdateProductionDto extends createZodDto(UpdateProductionSchema) {}
export class FilterProductionDto extends createZodDto(FilterProductionSchema) {}
export class PaginatedProductionDto extends PaginatedResponseDto(
  ProductionSchema,
) {}

// Event Wrappers
export class EventDto extends createZodDto(EventSchema) {}
export class CreateEventDto extends createZodDto(CreateEventSchema) {}
export class UpdateEventDto extends createZodDto(UpdateEventSchema) {}
export class FilterEventDto extends createZodDto(FilterEventSchema) {}
export class PaginatedEventDto extends PaginatedResponseDto(EventSchema) {}

// Blog Wrappers
export class BlogDto extends createZodDto(BlogSchema) {}
export class BlogViewDto extends createZodDto(BlogViewSchema) {}
export class CreateBlogDto extends createZodDto(CreateBlogSchema) {}
export class UpdateBlogDto extends createZodDto(UpdateBlogSchema) {}
export class PaginatedBlogDto extends PaginatedResponseDto(BlogSchema) {}
export class PaginatedBlogViewDto extends PaginatedResponseDto(
  BlogViewSchema,
) {}

// Tag Wrappers
export class TagDto extends createZodDto(TagSchema) {}
export class TagViewDto extends createZodDto(TagViewSchema) {}
export class CreateTagDto extends createZodDto(CreateTagSchema) {}
export class UpdateTagDto extends createZodDto(UpdateTagSchema) {}
export class PaginatedTagDto extends PaginatedResponseDto(TagSchema) {}

// Location Wrappers
export class LocationDto extends createZodDto(LocationSchema) {}
export class LocationViewDto extends createZodDto(LocationViewSchema) {}
export class CreateLocationDto extends createZodDto(CreateLocationSchema) {}
export class UpdateLocationDto extends createZodDto(UpdateLocationSchema) {}
export class PaginatedLocationDto extends PaginatedResponseDto(
  LocationSchema,
) {}

// Price Wrappers
export class PriceDto extends createZodDto(PriceSchema) {}
export class PriceViewDto extends createZodDto(PriceViewSchema) {}
export class CreatePriceDto extends createZodDto(CreatePriceSchema) {}
export class UpdatePriceDto extends createZodDto(UpdatePriceSchema) {}
export class PaginatedPriceDto extends PaginatedResponseDto(PriceSchema) {}

// Account Wrapper
export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}
export class UpdateAccountDto extends createZodDto(UpdateAccountSchema) {}
export class PublicAccountDto extends createZodDto(PublicAccountSchema) {}
export class PaginatedAccountDto extends PaginatedResponseDto(
  PublicAccountSchema,
) {}

// API keys Wrapper
export class ApiKeyDto extends createZodDto(ApiKeySchema) {}
export class VerifyApiKeyDto extends createZodDto(VerifyApiKeySchema) {}

// Generic Pagination Filter and Response Wrapper
export class PaginationFilterDto extends createZodDto(PaginationFilterSchema) {}
export function PaginatedResponseDto<T extends z.ZodTypeAny>(schema: T) {
  return createZodDto(PaginatedResponseSchema(schema));
}

// Language
export class LanguageQueryDto extends createZodDto(LanguageQuerySchema) {}
