import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAccountApi } from "../../app/composables/useAccountApi";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDel = vi.fn();

vi.mock("~/composables/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    del: mockDel,
  }),
}));


vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t:      (key: string) => key,
    locale: { value: "nl" },
  }),
  createI18n: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAccountApi", () => {
  it("getAll calls GET /auth", () => {
    const { getAll } = useAccountApi();
    getAll();
    expect(mockGet).toHaveBeenCalledWith("/auth");
  });

  it("getAll appends pagination query params", () => {
    const { getAll } = useAccountApi();
    getAll({ page: 1, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1"));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("limit=10"));
  });

  it("create calls POST /auth with body", () => {
    const { create } = useAccountApi();
    const body = { username: "admin", password: "secret" };
    create(body);
    expect(mockPost).toHaveBeenCalledWith("/auth", body);
  });

  it("modify calls PATCH /auth with body", () => {
    const { modify } = useAccountApi();
    const body = { id: 1, username: "updated" };
    modify(body);
    expect(mockPatch).toHaveBeenCalledWith("/auth", body);
  });

  it("remove calls DELETE /auth/:id", () => {
    const { remove } = useAccountApi();
    remove(1);
    expect(mockDel).toHaveBeenCalledWith("/auth/1");
  });
});
