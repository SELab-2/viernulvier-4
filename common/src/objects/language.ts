import { z } from "zod";

// If you want to add languages you can do so here.
export const SUPPORTED_LANGUAGES = ["en", "nl"] as const;

// Language Schemas.
export const LanguageEnum = z.enum(SUPPORTED_LANGUAGES);
export const LanguageQuerySchema = z.object({
  lang: LanguageEnum.optional().describe("The language code for the content."),
});

// Default language.
export const DEFAULT_LANGUAGE: Language = "nl";

// These allow us to have schemas inside of schemas for localization.
export const LocalizedStringSchema = z.record(LanguageEnum, z.string());
export const LocalizedStringNullableSchema = z
  .record(LanguageEnum, z.string())
  .nullable();

// Type exports.
export type Language = z.infer<typeof LanguageEnum>;
export type LanguageQuery = z.infer<typeof LanguageQuerySchema>;
