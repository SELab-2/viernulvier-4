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
import type { BlogView, PaginatedResponse } from "@repo/common";
import type { SearchSuggestion } from "~/components/SearchBar.vue";
import { formatDateShort } from "~/utils/formatters";
import { useBlogApi } from "./useBlogApi";

/**
 * Composable for anything related to the generic blog view.
 * Contains refs to the filters.
 */
export function useBlogView() {
  const { locale } = useI18n();
  const { getAll } = useBlogApi();

  // Filters

  const sortOrder = ref<"newest" | "oldest">("newest");
  const searchQuery = ref("");
  const dateFilter = ref<{ after?: string; before?: string }>({});

  function useBlogStory(story: MaybeRef<BlogView | null | undefined>) {
    // Unwrap to any once so every accessor below stays tidy.
    const s = computed(() => toValue(story));

    const title = computed<string>(() => s.value?.titel ?? "—");
    const description = computed<string>(() => s.value?.description ?? "");
    const storyId = computed<number>(() => s.value?.id ?? 0);

    const formattedDate = computed<string>(() => {
      if (!s.value?.created_at) return "";
      return formatDateShort(s.value.created_at, locale.value);
    });

    return {
      title,
      description,
      storyId,
      formattedDate,
    };
  }

  /**
   * Custom fetch function for suggestions
   * @param query
   */
  async function fetchSuggestions(
    query: string,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const resp = (await getAll({
      // This means we'll use 5 suggestions.
      paginationFilters: { page: 0, limit: limit, descending: true },
      blogFilters: {
        title: query,
        is_suggestion: true,
        ...dateFilter.value,
      },
      languageFilters: { lang: locale.value },
    })) as ApiResponse<PaginatedResponse<BlogView>>;

    if (!resp.data?.objects) return [];

    return resp.data.objects.map((b: BlogView): SearchSuggestion => {
      const title = b.titel || "";

      return {
        display: title,
        searchValue: title,
      };
    });
  }

  return {
    sortOrder,
    searchQuery,
    dateFilter,
    useBlogStory,
    fetchSuggestions,
  };
}
