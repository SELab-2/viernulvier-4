import { Injectable } from "@nestjs/common";
import { Language } from "@repo/common";

/**
 * This service provides functionality for working with languages in
 * the codebase.
 */
@Injectable()
export class LanguageService {
  /**
   * Flattens a JSON object or list of JSON objects recursively by their language.
   * This results in an object that contains only strings of the language specified
   * instead of JSON bodies with all languages.
   *
   * In Short:
   *  This function converts X to XView (X being the object name.)
   * @param data The Data we want to flatten.
   * @param lang The Language we want to flatten to, or no language at all.
   * @returns The Flattened object if a lang was provided, otherwise just the object
   *          that was provided.
   */
  flattenByLanguage<T>(data: any, lang: Language | undefined): T {
    if (!data) return data as T;
    if (!lang) return data as T;

    if (Array.isArray(data)) {
      return data.map((item) => this.flattenByLanguage(item, lang)) as T;
    }

    const flattened = { ...data } as Record<string, any>;

    for (const key in flattened) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = flattened[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        if (lang in value) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          flattened[key] = value[lang];
        } else {
          // TODO: Decide what we want to fallback to.
          // TODO: Could be Google Translate, or just "nl".
          flattened[key] = null;
        }
      }
    }

    return flattened as T;
  }
}
