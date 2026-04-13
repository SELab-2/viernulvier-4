import { describe, it, expect } from "vitest";
import { useGallery } from "../../app/composables/media/useGallery"; // Update path if needed
import type { MediaCrop, PrintItem } from "@repo/common";
import type {
  GalleryWithItems,
  ItemWithCrops,
} from "../../app/utils/galleryFetcher";

describe("useGallery", () => {
  describe("getMainImageCrop", () => {
    it("returns null if gallery is null or undefined", () => {
      const { getMainImageCrop } = useGallery();
      expect(getMainImageCrop(null, "hd_ready")).toBeNull();
      expect(getMainImageCrop(undefined, "hd_ready")).toBeNull();
    });

    it("returns null if gallery items array is empty", () => {
      const { getMainImageCrop } = useGallery();
      const gallery = {
        items: [],
      } as unknown as GalleryWithItems<ItemWithCrops>;
      expect(getMainImageCrop(gallery, "hd_ready")).toBeNull();
    });

    it("returns the requested crop from the item with position 'main'", () => {
      const { getMainImageCrop } = useGallery();
      const mockCrop = { id: 1, url: "test.jpg" } as MediaCrop;
      const gallery = {
        items: [
          { position: "carousel", crops: { hd_ready: { id: 2 } } },
          { position: "main", crops: { hd_ready: mockCrop } },
        ],
      } as unknown as GalleryWithItems<ItemWithCrops>;

      expect(getMainImageCrop(gallery, "hd_ready")).toEqual(mockCrop);
    });

    it("falls back to the first item if no item has position 'main'", () => {
      const { getMainImageCrop } = useGallery();
      const mockCrop = { id: 1, url: "fallback.jpg" } as MediaCrop;
      const gallery = {
        items: [
          { position: "carousel", crops: { hd_ready: mockCrop } }, // First item
          { position: "carousel", crops: { hd_ready: { id: 2 } } },
        ],
      } as unknown as GalleryWithItems<ItemWithCrops>;

      expect(getMainImageCrop(gallery, "hd_ready")).toEqual(mockCrop);
    });

    it("returns null if the main item exists but has no crops object", () => {
      const { getMainImageCrop } = useGallery();
      const gallery = {
        items: [{ position: "main", crops: null }],
      } as unknown as GalleryWithItems<ItemWithCrops>;

      expect(getMainImageCrop(gallery, "hd_ready")).toBeNull();
    });

    it("returns null if the main item has crops, but the requested cropName is missing", () => {
      const { getMainImageCrop } = useGallery();
      const gallery = {
        items: [{ position: "main", crops: { thumbnail: { id: 1 } } }],
      } as unknown as GalleryWithItems<ItemWithCrops>;

      expect(getMainImageCrop(gallery, "hd_ready")).toBeNull();
    });
  });

  describe("getCarouselImageCrops", () => {
    it("returns an empty array if gallery is null or undefined", () => {
      const { getCarouselImageCrops } = useGallery();
      expect(getCarouselImageCrops(null, "hd_ready")).toEqual([]);
      expect(getCarouselImageCrops(undefined, "hd_ready")).toEqual([]);
    });

    it("returns an empty array if gallery items array is empty", () => {
      const { getCarouselImageCrops } = useGallery();
      const gallery = {
        items: [],
      } as unknown as GalleryWithItems<ItemWithCrops>;
      expect(getCarouselImageCrops(gallery, "hd_ready")).toEqual([]);
    });

    it("returns an array of crops for items with position 'carousel'", () => {
      const { getCarouselImageCrops } = useGallery();
      const mockCrop1 = { id: 1, url: "c1.jpg" } as MediaCrop;
      const mockCrop2 = { id: 2, url: "c2.jpg" } as MediaCrop;
      const gallery = {
        items: [
          { position: "carousel", crops: { hd_ready: mockCrop1 } },
          { position: "main", crops: { hd_ready: { id: 99 } } }, // Should be ignored
          { position: "carousel", crops: { hd_ready: mockCrop2 } },
        ],
      } as unknown as GalleryWithItems<ItemWithCrops>;

      expect(getCarouselImageCrops(gallery, "hd_ready")).toEqual([
        mockCrop1,
        mockCrop2,
      ]);
    });

    it("skips carousel items that do not have the requested cropName", () => {
      const { getCarouselImageCrops } = useGallery();
      const mockCrop1 = { id: 1, url: "c1.jpg" } as MediaCrop;
      const gallery = {
        items: [
          { position: "carousel", crops: { hd_ready: mockCrop1 } },
          { position: "carousel", crops: { thumbnail: { id: 2 } } }, // Missing 'hd_ready'
        ],
      } as unknown as GalleryWithItems<ItemWithCrops>;

      // Should only return the crop from the first item
      expect(getCarouselImageCrops(gallery, "hd_ready")).toEqual([mockCrop1]);
    });

    it("returns an empty array if there are items, but none are position 'carousel'", () => {
      const { getCarouselImageCrops } = useGallery();
      const gallery = {
        items: [{ position: "main", crops: { hd_ready: { id: 1 } } }],
      } as unknown as GalleryWithItems<ItemWithCrops>;

      expect(getCarouselImageCrops(gallery, "hd_ready")).toEqual([]);
    });
  });

  describe("getPrints", () => {
    it("returns an empty array if gallery is null or undefined", () => {
      const { getPrints } = useGallery();
      expect(getPrints(null)).toEqual([]);
      expect(getPrints(undefined)).toEqual([]);
    });

    it("returns an empty array if gallery items array is empty", () => {
      const { getPrints } = useGallery();
      const gallery = { items: [] } as unknown as GalleryWithItems<PrintItem>;
      expect(getPrints(gallery)).toEqual([]);
    });

    it("returns the gallery items as print items", () => {
      const { getPrints } = useGallery();
      const mockPrints = [
        {
          id: 1,
          titel: { en: "Print Title", nl: "Print Titel" },
          description: { en: "Print Desc", nl: "Print Beschrijving" },
          url: "https://example.com/print.pdf",
          created_at: "2026-03-28T14:00:00.000Z",
          updated_at: "2026-03-28T14:00:00.000Z",
        },
        {
          id: 2,
          titel: { en: "Print Title", nl: "Print Titel" },
          description: { en: "Print Desc", nl: "Print Beschrijving" },
          url: "https://example.com/print.pdf",
          created_at: "2026-03-28T14:00:00.000Z",
          updated_at: "2026-03-28T14:00:00.000Z",
        },
      ] as PrintItem[];
      const gallery = { items: mockPrints } as GalleryWithItems<PrintItem>;

      expect(getPrints(gallery)).toEqual(mockPrints);
    });
  });
});
