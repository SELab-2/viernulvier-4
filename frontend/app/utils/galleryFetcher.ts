import type {
  CropName,
  MediaCrop,
  MediaGallery,
  MediaItem,
  PrintItem,
} from "@repo/common";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";

export interface PrintGallery extends MediaGallery {
  type: "prints";
}

export interface DefaultGallery extends MediaGallery {
  type: "default";
}

/**
 * A gallery object with it's full items attached.
 * The items themselves already own the urls to their images.
 */
export interface GalleryWithItems<
  T extends ItemWithCrops | PrintItem,
> extends MediaGallery {
  items: T[];
}

/**
 * A media item with it's crops mapped out in a dictionary.
 */
export interface ItemWithCrops extends MediaItem {
  crops: Partial<Record<CropName, MediaCrop>>;
}

/**
 * These are used to overload the typing behaviour based on what type is in the
 * galleries.
 */
export async function fetchFullGallery(
  gallery: PrintGallery,
): Promise<GalleryWithItems<PrintItem>>;
export async function fetchFullGallery(
  gallery: DefaultGallery,
): Promise<GalleryWithItems<ItemWithCrops>>;

/**
 * Fetches a full gallery with it's items/prints and crops attached.
 * @param gallery The original gallery that was fetched from the backend.
 * @returns The GalleryWithItems object.
 */
export async function fetchFullGallery(
  gallery: MediaGallery,
): Promise<GalleryWithItems<any>> {
  const { getGalleryItems } = useGalleryApi();
  const { getItemCrops } = useItemApi();

  const items: MediaItem[] | PrintItem[] =
    (await getGalleryItems(gallery.id)).data ?? [];

  // If it's a print gallery we can just return the prints.
  if (gallery.type == "prints") {
    return { ...gallery, items: items as PrintItem[] };
  }

  // Otherwise we need to fetch all the crops at the same time.
  const itemsWithCrops = await Promise.all(
    items.map(async (item) => {
      const crops: MediaCrop[] = (await getItemCrops(item.id)).data ?? [];
      const cropDictionary = crops.reduce(
        (accumulator, currentCrop) => {
          const key = currentCrop.name;
          accumulator[key] = currentCrop;
          return accumulator;
        },
        {} as Partial<Record<CropName, MediaCrop>>,
      );

      return { ...item, crops: cropDictionary };
    }),
  );

  return {
    ...gallery,
    items: itemsWithCrops as ItemWithCrops[],
  };
}
