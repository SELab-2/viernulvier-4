import {
  ApiKeySchema,
  BlogSchema,
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
  LocationSchema,
  PriceSchema,
  ProductionSchema,
  PublicAccountSchema,
  TagSchema,
  UpdateAccountSchema,
  UpdateBlogSchema,
  UpdateEventSchema,
  UpdateLocationSchema,
  UpdatePriceSchema,
  UpdateProductionSchema,
  UpdateTagSchema,
  VerifyApiKeySchema,
  LanguageQuerySchema,
  PaginationFilterSchema,
  ProductionViewSchema,
  TagViewSchema,
  BlogViewSchema,
  LocationViewSchema,
  PriceViewSchema,
} from "@repo/common";
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

// Generic Pagination Filter Wrapper
export class PaginationFilterDto extends createZodDto(PaginationFilterSchema) {}

// Language
export class LanguageQueryDto extends createZodDto(LanguageQuerySchema) {}
