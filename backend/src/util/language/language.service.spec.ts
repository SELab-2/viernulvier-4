import { Test, TestingModule } from "@nestjs/testing";
import { LanguageService } from "./language.service";
import { Language } from "@repo/common";
import { AppLogger } from "../logger/logger.service";
import { ConfigService } from "@nestjs/config";

// --- Interfaces for Testing ---
interface LocalizedText {
  en?: string;
  nl?: string;
}

interface MockEntity {
  id?: number;
  titel?: LocalizedText;
  description?: LocalizedText;
  tag?: LocalizedText;
  is_active?: boolean;
  created_at?: Date;
  tags?: string[];
  empty_field?: null;
}

interface MockEntityView {
  id?: number;
  titel?: string | null;
  description?: string | null;
  tag?: string | null;
  is_active?: boolean;
  created_at?: Date;
  tags?: string[];
  empty_field?: null;
}
// ------------------------------

describe("LanguageService", () => {
  let service: LanguageService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue("development"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageService,
        {
          provide: AppLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LanguageService>(LanguageService);
  });

  describe("Initialization", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });
  });

  describe("flattenByLanguage", () => {
    // --- Edge Cases & Early Returns ---

    it("should return the original data if data is null or undefined", () => {
      expect(
        service.flattenByLanguage<null>(null, "en" as Language),
      ).toBeNull();
      expect(
        service.flattenByLanguage<undefined>(undefined, "en" as Language),
      ).toBeUndefined();
    });

    it("should return the original data if no language is provided", () => {
      const data: MockEntity = { titel: { en: "Hello", nl: "Hallo" } };
      expect(service.flattenByLanguage<MockEntity>(data, undefined)).toEqual(
        data,
      );
    });

    // --- Object Flattening ---

    it("should properly flatten an object containing localized strings", () => {
      const data: MockEntity = {
        id: 1,
        titel: { en: "English Title", nl: "Nederlandse Titel" },
        description: { en: "English Desc", nl: "Nederlandse Desc" },
        is_active: true,
      };

      const expectedEn: MockEntityView = {
        id: 1,
        titel: "English Title",
        description: "English Desc",
        is_active: true,
      };

      const expectedNl: MockEntityView = {
        id: 1,
        titel: "Nederlandse Titel",
        description: "Nederlandse Desc",
        is_active: true,
      };

      expect(
        service.flattenByLanguage<MockEntityView>(data, "en" as Language),
      ).toEqual(expectedEn);
      expect(
        service.flattenByLanguage<MockEntityView>(data, "nl" as Language),
      ).toEqual(expectedNl);
    });

    it("should set the property to null if the requested language is missing", () => {
      const data: MockEntity = {
        id: 1,
        titel: { nl: "Alleen Nederlands" }, // 'en' is missing
      };

      const expectedEn: MockEntityView = {
        id: 1,
        titel: null, // Fallback behavior defined in your service
      };

      expect(
        service.flattenByLanguage<MockEntityView>(data, "en" as Language),
      ).toEqual(expectedEn);
    });

    // --- Array Flattening ---

    it("should recursively flatten an array of objects", () => {
      const data: MockEntity[] = [
        { id: 1, tag: { en: "Action", nl: "Actie" } },
        { id: 2, tag: { en: "Drama", nl: "Drama" } },
      ];

      const expectedEn: MockEntityView[] = [
        { id: 1, tag: "Action" },
        { id: 2, tag: "Drama" },
      ];

      expect(
        service.flattenByLanguage<MockEntityView[]>(data, "en" as Language),
      ).toEqual(expectedEn);
    });

    // --- Data Type Preservation ---

    it("should not mutate Date objects, arrays, or null values inside the payload", () => {
      const testDate = new Date("2026-03-08T00:00:00.000Z");
      const data: MockEntity = {
        id: 1,
        titel: { en: "Title", nl: "Titel" },
        created_at: testDate, // Date object
        tags: ["tag1", "tag2"], // Array
        empty_field: null, // Null value
      };

      const result = service.flattenByLanguage<MockEntityView>(
        data,
        "en" as Language,
      );

      expect(result.titel).toBe("Title");
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.created_at).toEqual(testDate);
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags).toEqual(["tag1", "tag2"]);
      expect(result.empty_field).toBeNull();
    });
  });
});
