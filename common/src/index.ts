import { z } from "zod";
import {
  Event,
  CreateEvent,
  UpdateEvent,
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  Production,
  ProductionSchema,
  CreateProduction,
  CreateProductionSchema,
  UpdateProduction,
  UpdateProductionSchema,
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
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
};
export type { Production, CreateProduction, UpdateProduction, Event, CreateEvent, UpdateEvent };
export type HelloWorld = z.infer<typeof HelloWorldSchema>;
