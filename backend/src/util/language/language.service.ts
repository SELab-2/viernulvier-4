import { Injectable } from "@nestjs/common";
import { Language } from "@repo/common";
import { AppLogger } from "../logger/logger.service";
import * as deepl from "deepl-node";
import { Translator } from "deepl-node";

/**
 * This service provides functionality for working with languages in
 * the codebase.
 */
@Injectable()
export class LanguageService {
  private translator: Translator;

  constructor(private readonly logger: AppLogger) {
    // change this constructor when changing provider.
    const apiKey = process.env.TRANSLATE_API_KEY;

    if (!apiKey) {
      throw new Error("env variable TRANSLATE_API_KEY is not defined");
    }

    this.translator = new deepl.Translator(apiKey);
  }

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

    // handle paginated wrapper
    if (
      typeof data === "object" &&
      "objects" in data &&
      "page" in data &&
      "limit" in data &&
      "totalItems" in data
    ) {
      return {
        ...data,
        objects: this.flattenByLanguage(data.objects, lang),
      } as T;
    }

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
          flattened[key] = null;
        }
      }
    }

    return flattened as T;
  }

  /**
   * This function translates all fields of a given object from a language to a language
   * @param data is the object you want to translate i.e. a production
   * @param langFrom is the language you want to translate from
   * @param langTo is the language you want to translate to
   * @returns the object with all the new languages added to it.
   */
  async translateObject<T>(
    data: any,
    langFrom: Language,
    langTo: Language,
  ): Promise<T> {
    if (!data) return data as T;

    // Handle arrays
    if (Array.isArray(data)) {
      return Promise.all(
        data.map((item) => this.translateObject(item, langFrom, langTo)),
      ) as Promise<T>;
    }

    // Only process real objects
    if (typeof data !== "object") {
      return data;
    }

    const result: Record<string, any> = { ...data };

    for (const key of Object.keys(result)) {
      const value = result[key];

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value[langFrom]
      ) {
        result[key] = await this.translateText(value, langFrom, langTo);
      } else if (typeof value === "object") {
        result[key] = await this.translateObject(value, langFrom, langTo);
      }
    }

    return result as T;
  }

  /**
   * This function takes a language JSON (as described in the database & backend documentation) and adds translation to it.
   * note that this function will modify the given object in memory.
   * @param data is the JSON object. Note that it must be a language JSON for this to work
   * @param langFrom is the language we will be using to translate
   * @param langTo is the target language that we want to translate to
   * @returns a language JSON, same as before just with the translated language added to it.
   */
  async translateText(
    data: Partial<Record<Language, string>>,
    langFrom: Language,
    langTo: Language,
  ): Promise<Partial<Record<Language, string>>> {
    const sourceText = data[langFrom];

    if (!sourceText) {
      this.logger.warn("Base language is not defined");
      return data; // don't break API communication
    }

    // Do not overwrite existing translation
    if (data[langTo]) {
      return data;
    }

    try {
      const result = await this.translator.translateText(
        sourceText,
        // need to cast here for the function to recognize the typing.
        this.formatSourceLanguageHelper(langFrom),
        this.formatTargetLanguageHelper(langTo),
      );

      // rate limiting
      // you will need to add more rate limiting or remove it depending on what your plan is or who your provider is.
      await new Promise((r) => setTimeout(r, 100));

      data[langTo] = result.text;
    } catch (error) {
      this.logger.error(`Translation failed: ${error?.message}`, error);

      // fallback: copy original language
      data[langTo] = sourceText;
    }

    return data;
  }

  formatSourceLanguageHelper(lang: Language): deepl.SourceLanguageCode {
    if (!lang) {
      throw new Error("Source language is required");
    }

    // allows adding of types like in TagetLanguageHelper.
    return lang.toUpperCase() as deepl.SourceLanguageCode;
  }

  formatTargetLanguageHelper(lang: Language): deepl.TargetLanguageCode {
    if (!lang) {
      throw new Error("Target language is required");
    }

    const upper = lang.toUpperCase();

    // add cases here like nl-BE etc...
    // default fallback is just normal upper.
    switch (upper) {
      case "EN":
        return "en-GB"; // or "en-US"
      default:
        return upper as deepl.TargetLanguageCode;
    }
  }
}
