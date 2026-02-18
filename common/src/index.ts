import { z } from "zod";
import {
  Event,
  EventSchema,
  Production,
  ProductionSchema,
} from "./database_objects";

// Een voorbeeld van een globaal schema...
export const HelloWorldSchema = z.object({
  text: z.string(),
});

// list of all exports: (this way only need to import this file.)
export { ProductionSchema, EventSchema };
export type { Production, Event };
export type HelloWorld = z.infer<typeof HelloWorldSchema>;
