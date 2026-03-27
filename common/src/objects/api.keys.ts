import { z } from "zod";

// Base APIKey object.
export const ApiKeySchema = z.object({
  key: z.string(), // strings are unique.
  id: z.number(), // id is here for the join-table operations.
});

// Schema without the API to verify.
export const VerifyApiKeySchema = ApiKeySchema.omit({ id: true });

// Type exports.
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type VerifyApiKey = z.infer<typeof VerifyApiKeySchema>;
