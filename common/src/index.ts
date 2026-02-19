import { z } from "zod";
import {
  Event,
  UpdateEvent,
  EventSchema,
  UpdateEventSchema,
  Production,
  ProductionSchema,
} from "./database_objects";

// Een voorbeeld van een globaal schema...
export const HelloWorldSchema = z.object({
  text: z.string(),
});

// list of all exports: (this way only need to import this file.)
export { ProductionSchema, EventSchema, UpdateEventSchema };
export type { Production, Event, UpdateEvent };
export type HelloWorld = z.infer<typeof HelloWorldSchema>;
