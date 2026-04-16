import type {
  CropName,
  Language,
  MediaCrop,
  MediaGallery,
  MediaItem,
  MediaItemView,
  PrintItem,
  PrintItemView,
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
export interface GalleryWithItems<T> extends MediaGallery {
  items: T[];
}

/**
 * A media item with it's crops mapped out in a dictionary.
 */
export interface ItemWithCrops extends MediaItem {
  crops: Partial<Record<CropName, MediaCrop>>;
}

/**
 * A media item view with it's crops mapped out.
 */
export interface ItemViewWithCrops extends MediaItemView {
  crops: Partial<Record<CropName, MediaCrop>>;
}

/**
 * These are used to overload the typing behaviour based on what type is in the
 * galleries.
 */
export async function fetchFullGallery(
  gallery: PrintGallery,
  lang?: Language,
): Promise<GalleryWithItems<PrintItem | PrintItemView>>;
export async function fetchFullGallery(
  gallery: DefaultGallery,
  lang?: Language,
): Promise<GalleryWithItems<ItemWithCrops | ItemViewWithCrops>>;

/**
 * Fetches a full gallery with it's items/prints and crops attached.
 * @param gallery The original gallery that was fetched from the backend.
 * @returns The GalleryWithItems object.
 */
export async function fetchFullGallery(
  gallery: MediaGallery,
  lang?: Language,
): Promise<GalleryWithItems<any>> {
  const { getGalleryItems } = useGalleryApi();
  const { getItemCrops } = useItemApi();

  const items: MediaItem[] | PrintItem[] | MediaItemView[] | PrintItemView[] =
    (await getGalleryItems(gallery.id, lang)).data ?? [];

  // If it's a print gallery we can just return the prints.
  if (gallery.type == "prints") {
    return { ...gallery, items: items as PrintItem[] | PrintItemView[] };
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
    items: itemsWithCrops as ItemWithCrops[] | ItemViewWithCrops[],
  };
}
