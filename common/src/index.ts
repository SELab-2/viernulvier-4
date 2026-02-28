import { z } from "zod";
import {
  Blog,
  BlogSchema,
  CreateBlog,
  CreateBlogSchema,
  CreateEvent,
  CreateEventSchema,
  CreateProduction,
  CreateProductionSchema,
  CreateTag,
  CreateTagSchema,
  Event,
  EventSchema,
  FilterProduction,
  FilterProductionSchema,
  Production,
  ProductionSchema,
  Tag,
  TagSchema,
  UpdateBlog,
  UpdateBlogSchema,
  UpdateEvent,
  UpdateEventSchema,
  UpdateProduction,
  UpdateProductionSchema,
  UpdateTag,
  UpdateTagSchema,
} from "./database_objects";

// Een voorbeeld van een globaal schema...
export const HelloWorldSchema = z.object({
  text: z.string(),
});

// list of all exports: (this way only need to import this file.)
export {
  ProductionSchema,
  CreateProductionSchema,
  UpdateProductionSchema,
  FilterProductionSchema,
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  BlogSchema,
  UpdateBlogSchema,
  CreateBlogSchema,
  TagSchema,
  CreateTagSchema,
  UpdateTagSchema,
};
export type {
  Production,
  CreateProduction,
  UpdateProduction,
  FilterProduction,
  Event,
  CreateEvent,
  UpdateEvent,
  Tag,
  CreateTag,
  UpdateTag,
  Blog,
  CreateBlog,
  UpdateBlog,
};
export type HelloWorld = z.infer<typeof HelloWorldSchema>;
