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
import { formatDateShort, stripHtml } from "~/utils/formatters";

export function useBlogStory(story: MaybeRef<BlogView | null>) {
  const { locale } = useI18n();
  const s = computed(() => toValue(story));

  const title = computed<string>(() => s.value?.titel ?? "—");
  const description = computed<string>(() => s.value?.description ?? "");
  // Stripped plain text for card previews
  const previewText = computed<string>(() => stripHtml(description.value));
  const storyId = computed<number>(() => s.value?.id ?? 0);

  const formattedDate = computed<string>(() => {
    if (!s.value?.created_at) return "";
    return formatDateShort(s.value.created_at, locale.value);
  });

  return { title, description, previewText, storyId, formattedDate };
}
