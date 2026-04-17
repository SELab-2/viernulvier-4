import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePrintApi } from "../../app/composables/media/usePrintApi";
import type { CreatePrintItem, ReplacePrintItem } from "@repo/common";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockDel = vi.fn();

vi.mock("~/composables/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    del: mockDel,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePrintApi", () => {
  it("getAll calls GET /prints", () => {
    const { getAll } = usePrintApi();
    void getAll();
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("/prints");
  });

  it("getAll appends pagination, language, and type filter query params", () => {
    const { getAll } = usePrintApi();
    void getAll({
      paginationFilters: { page: 1, limit: 10, descending: true },
      languageFilters: { lang: "en" },
      printItemFilters: { type: "affiche" },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("page=1");
    expect(url).toContain("limit=10");
    expect(url).toContain("lang=en");
    expect(url).toContain("type=affiche");
  });

  it("getById calls GET /prints/:id", () => {
    const { getById } = usePrintApi();
    void getById(1);
    expect(mockGet).toHaveBeenCalledWith("/prints/1"); // Assuming base resolves to /prints
  });

  it("getById appends lang param", () => {
    const { getById } = usePrintApi();
    void getById(1, "nl");
    expect(mockGet).toHaveBeenCalledWith("/prints/1?lang=nl");
  });

  it("create calls POST /prints with body", () => {
    const { create } = usePrintApi();
    const body: CreatePrintItem = {
      title: "New Poster",
      type: "poster",
    } as unknown as CreatePrintItem;
    void create(body);
    expect(mockPost).toHaveBeenCalledWith("/prints", body);
  });

  it("replace calls PUT /prints/:id with body", () => {
    const { replace } = usePrintApi();
    const body: ReplacePrintItem = {
      id: 1,
      title: "Updated Poster",
      type: "poster",
    } as unknown as ReplacePrintItem;
    void replace(1, body);
    expect(mockPut).toHaveBeenCalledWith("/prints/1", body);
  });

  it("modify calls PATCH /prints/:id with body", () => {
    const { modify } = usePrintApi();
    void modify(1, {
      titel: { en: "Print Title", nl: "Print Titel" },
      description: { en: "Print Desc", nl: "Print Beschrijving" },
      url: "https://example.com/print.pdf",
      print_type: "affiche",
    });
    expect(mockPatch).toHaveBeenCalledWith("/prints/1", {
      titel: { en: "Print Title", nl: "Print Titel" },
      description: { en: "Print Desc", nl: "Print Beschrijving" },
      url: "https://example.com/print.pdf",
      print_type: "affiche",
    });
  });

  it("remove calls DELETE /prints/:id", () => {
    const { remove } = usePrintApi();
    void remove(1);
    expect(mockDel).toHaveBeenCalledWith("/prints/1");
  });
});
