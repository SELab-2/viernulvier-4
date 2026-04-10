/**
 * components/blogs/useBlogStory.ts
 * ----------------------------
 * Shared logic for displaying a single BlogView.
 *
 * Used by:
 *   - components/blogs/StoryListItem.vue
 *   - pages/blog/[id].vue
 *
 * Both components need the same set of derived values (title, description,
 * image, formatted date, placeholder gradient) from a BlogView whose fields
 * are already flat strings (backend returns them localised via the lang param).
 */
import type { BlogView } from "@repo/common";
import { pickPlaceholderGradient } from "~/utils/constants";
import { formatDateShort } from "~/utils/formatters";

export function useBlogStory(story: MaybeRef<BlogView | null>) {
  const { locale } = useI18n();

  // Unwrap to any once so every accessor below stays tidy.
  const s = computed(() => toValue(story) as any);

  const title = computed<string>(() => s.value?.titel ?? "—");
  const description = computed<string>(() => s.value?.description ?? "");
  const image = computed<string | null>(() => s.value?.image ?? null);
  const storyId = computed<number>(() => s.value?.id ?? 0);

  const formattedDate = computed<string>(() => {
    if (!s.value?.created_at) return "";
    return formatDateShort(s.value.created_at, locale.value);
  });

  const placeholderGradient = computed<string>(() =>
    pickPlaceholderGradient(storyId.value),
  );

  return {
    title,
    description,
    image,
    storyId,
    formattedDate,
    placeholderGradient,
  };
}
