import { BlogSchema, CreateBlogSchema, CreateEventSchema, CreateProductionSchema, EventSchema, ProductionSchema, UpdateBlogSchema, UpdateEventSchema, UpdateProductionSchema } from "@repo/common";
import { createZodDto } from "nestjs-zod";
// This file wraps the Objects into an DTO Swagger can see.

// Production Wrappers
export class ProductionDto extends createZodDto(ProductionSchema) {}
export class CreateProductionDto extends createZodDto(CreateProductionSchema) {}
export class UpdateProductionDto extends createZodDto(UpdateProductionSchema) {}

// Event Wrappers
export class EventDto extends createZodDto(EventSchema) {}
export class CreateEventDto extends createZodDto(CreateEventSchema) {}
export class UpdateEventDto extends createZodDto(UpdateEventSchema) {}

// Blogs
export class BlogDto extends createZodDto(BlogSchema) {}
export class CreateBlogDto extends createZodDto(CreateBlogSchema) {}
export class UpdateBlogDto extends createZodDto(UpdateBlogSchema) {}
