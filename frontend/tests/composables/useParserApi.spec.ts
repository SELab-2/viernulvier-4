import { describe, it, expect, vi, beforeEach } from "vitest";
import { useParserApi } from "../../app/composables/useParserApi";

const mockPost = vi.fn();

vi.mock("~/composables/useApi", () => ({
  useApi: () => ({
    post: mockPost,
  }),
}));


beforeEach(() => {
  vi.clearAllMocks();
});

describe("useParserApi", () => {
  describe("uploadCsv", () => {
    it("should upload CSV file for productions target", () => {
      const { uploadCsv } = useParserApi();
      const file = new File(["test"], "test.csv", { type: "text/csv" });

      uploadCsv("productions", file);

      expect(mockPost).toHaveBeenCalledOnce();
      const [endpoint, formData] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/parser/productions");
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("file")).toBe(file);
    });

    it("should upload CSV file for events target", () => {
      const { uploadCsv } = useParserApi();
      const file = new File(["test"], "events.csv", { type: "text/csv" });

      uploadCsv("events", file);

      expect(mockPost).toHaveBeenCalledOnce();
      const [endpoint, formData] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/parser/events");
      expect(formData.get("file")).toBe(file);
    });

    it("should upload CSV file for tags target", () => {
      const { uploadCsv } = useParserApi();
      const file = new File(["test"], "tags.csv", { type: "text/csv" });

      uploadCsv("tags", file);

      const [endpoint] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/parser/tags");
    });

    it("should upload CSV file for blogs target", () => {
      const { uploadCsv } = useParserApi();
      const file = new File(["test"], "blogs.csv", { type: "text/csv" });

      uploadCsv("blogs", file);

      const [endpoint] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/parser/blogs");
    });

    it("should upload CSV file for prices target", () => {
      const { uploadCsv } = useParserApi();
      const file = new File(["test"], "prices.csv", { type: "text/csv" });

      uploadCsv("prices", file);

      const [endpoint] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/parser/prices");
    });

    it("should create FormData with file field matching field name", () => {
      const { uploadCsv } = useParserApi();
      const file = new File(["csv,data"], "test.csv", { type: "text/csv" });

      uploadCsv("productions", file);

      const [, formData] = mockPost.mock.calls[0];
      // FormData.get() retrieves by field name
      expect(formData.get("file")).toBe(file);
    });

    it("should preserve file properties in FormData", () => {
      const { uploadCsv } = useParserApi();
      const file = new File(["name,value\ntest,123"], "data.csv", {
        type: "text/csv",
      });

      uploadCsv("productions", file);

      const [, formData] = mockPost.mock.calls[0];
      const uploadedFile = formData.get("file") as File;
      expect(uploadedFile.name).toBe("data.csv");
      expect(uploadedFile.type).toBe("text/csv");
    });
  });
});
