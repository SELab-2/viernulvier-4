import type { CropName, MediaCrop, PrintItem } from "@repo/common";
import type { GalleryWithItems, ItemWithCrops } from "~/utils/galleryFetcher";

/**
 * These are composables that can be used to select images or prints.
 */
export function useGallery() {
  /**
   * Returns the asked crop of the main item within a media gallery.
   * @param gallery The gallery.
   * @param cropName The name of the crop we want.
   * @returns The crop if it was found or null.
   */
  const getMainImageCrop = (
    gallery: GalleryWithItems<ItemWithCrops> | null | undefined,
    cropName: CropName,
  ): MediaCrop | null => {
    if (!gallery || !gallery.items.length) return null;

    const mainItem =
      gallery.items.find((item: ItemWithCrops) => item.position == "main") ||
      gallery.items[0];

    if (!mainItem?.crops) return null;

    const crop = mainItem.crops[cropName];

    return crop || null;
  };

  /**
   * Returns the asked crops for the carousel images of a gallery.
   * @param gallery The gallery.
   * @param cropName The Name of the crop.
   * @returns The list of crops that match.
   */
  const getCarouselImageCrops = (
    gallery: GalleryWithItems<ItemWithCrops> | null | undefined,
    cropName: CropName,
  ): MediaCrop[] => {
    if (!gallery || !gallery.items.length) return [];

    const items = gallery.items.filter(
      (item: ItemWithCrops) => item.position == "carousel",
    );

    const crops: MediaCrop[] = [];
    for (const item of items) {
      if (item.crops[cropName]) {
        crops.push(item.crops[cropName]);
      }
    }

    return crops;
  };

  /**
   * Get the prints from a gallery.
   * @param gallery The gallery.
   * @returns A list of all print items.
   */
  const getPrints = (gallery: GalleryWithItems<PrintItem>): PrintItem[] => {
    if (!gallery || !gallery.items.length) return [];

    const prints = gallery.items;
    return prints;
  };

  return { getMainImageCrop, getCarouselImageCrops, getPrints };
}
