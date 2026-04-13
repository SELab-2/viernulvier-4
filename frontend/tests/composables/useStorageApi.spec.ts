import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStorageApi } from "../../app/composables/media/useStorageApi";

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

describe("useStorageApi", () => {
  it("saveMedia calls POST to storage base with FormData", () => {
    const { saveMedia } = useStorageApi();

    // Create a mock File object to simulate an upload
    const mockFile = new File(["dummy content"], "test.jpg", {
      type: "image/jpeg",
    });
    const targetUrl = "/media/test.jpg";

    void saveMedia(targetUrl, mockFile);

    // Extract the exact arguments passed to mockPost
    const url = mockPost.mock.calls[0][0] as string;
    const body = mockPost.mock.calls[0][1] as FormData;

    // Verify the route
    expect(url).toContain("/storage");

    // Verify the FormData object was constructed correctly
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("url")).toBe(targetUrl);
    expect(body.get("file")).toEqual(mockFile);
  });

  it("deleteMedia calls DELETE to storage base with an encoded URL query param", () => {
    const { deleteMedia } = useStorageApi();

    // Use a URL with special characters to ensure encoding works
    const targetUrl = "https://example.com/media/my image test.jpg";
    const encodedUrl = encodeURIComponent(targetUrl);

    void deleteMedia(targetUrl);

    // Extract the exact argument passed to mockDel
    const url = mockDel.mock.calls[0][0] as string;

    // Verify the route and the encoded query string
    expect(url).toContain("/storage");
    expect(url).toContain(`?url=${encodedUrl}`);
  });
});
