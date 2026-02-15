import { z } from "zod";

// Een voorbeeld van een globaal schema...
export const HelloWorldSchema = z.object({
  text: z.string(),
});

export type HelloWorld = z.infer<typeof HelloWorldSchema>;
