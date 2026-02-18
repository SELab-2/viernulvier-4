import { z } from "zod";
import { EventSchema, ProductionSchema } from "./database_objects";
// Een voorbeeld van een globaal schema...
export const HelloWorldSchema = z.object({
  text: z.string(),
});

// list of all exports: (this way only need to import this file.)
export const Production = ProductionSchema;
export const Event = EventSchema;
export type HelloWorld = z.infer<typeof HelloWorldSchema>;
