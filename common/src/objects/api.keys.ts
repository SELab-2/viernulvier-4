import { z } from "zod";

export const ApiKeySchema = z.object({
  key: z.string(), // strings are unique.
  id: z.number(), // id is here for the join-table operations.
});
export const VerifyApiKeySchema = ApiKeySchema.omit({ id: true });

export type ApiKey = z.infer<typeof ApiKeySchema>;
export type VerifyApiKey = z.infer<typeof VerifyApiKeySchema>;
