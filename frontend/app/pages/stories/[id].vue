<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-vue-next";
import type { BlogView, MediaItemView } from "@repo/common";
import { cleanText } from "~/utils/formatters";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useProductionApi } from "~/composables/useProductionApi";
import { useGallery } from "~/composables/media/useGallery";
import { ROUTES } from "~/utils/routes";
import { useBlogView } from "~/composables/blogs/useBlogView";

const route = useRoute();
const { t, locale } = useI18n();
const { getMainImageCrop } = useGallery();
const { getById, getMediaGallery } = useBlogApi();
const { getAll: getProductions } = useProductionApi();
const { useBlogStory } = useBlogView();
const router = useRouter();

/** validation that id is only numbers */
definePageMeta({
  validate: async (route) => {
    const raw = Array.isArray(route.params.id)
      ? route.params.id[0]
      : route.params.id;
    return /^\d+$/.test(raw as string);
  },
});

// Let's you go back to the previous page!
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(ROUTES.stories.base); // Fallback
  }
};

/** Parse the blog ID from the URL, returning null for non-numeric values. */
const blogId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

/** Get the main blog data and handle API nesting */
const { data, status, error } = useAsyncData<BlogView | null>(
  `blog-v3-${blogId.value}-${locale.value}`,
  async () => {
    if (blogId.value === null) return null;
    const res = (await getById(
      blogId.value,
      locale.value as "nl" | "en",
    )) as any;
    return (res?.data ?? res) as BlogView;
  },
  { watch: [blogId, locale] },
);

// Watch the blog fetch to see if everything is fetched correctly.
watch(
  [status, error, data],
  ([newStatus, newError, newBlog]) => {
    if (newStatus === "success" && !newBlog) {
      showError({
        statusCode: 404,
        statusMessage: "Blog not found",
        fatal: true,
      });
    } else if (newError) {
      showError({ statusCode: 500, statusMessage: "API Error", fatal: true });
    }
  },
  { immediate: true },
);

const blog = computed(() => data.value);

/** Get the media gallery. */
const { data: gallery } = useAsyncData(
  `blog-gallery-${blogId.value}-${locale.value}`,
  async () => {
    if (!blogId.value) return null;
    const res = await getMediaGallery(blogId.value, locale.value);
    return (res as any)?.data ?? res;
  },
  { watch: [blogId, locale] },
);

/** Pagination state and logic for the "Show All" button.*/
const LINKED_PRODUCTIONS_LIMIT = 3;
const currentLimit = ref(LINKED_PRODUCTIONS_LIMIT);
const totalLinkedProductions = ref(0);

const productionListIsExpanded = computed(() => {
  return (
    currentLimit.value >= totalLinkedProductions.value &&
    totalLinkedProductions.value > LINKED_PRODUCTIONS_LIMIT
  );
});

const hasHiddenProductions = computed(() => {
  return totalLinkedProductions.value > LINKED_PRODUCTIONS_LIMIT;
});

const toggleProductionsLimit = () => {
  if (productionListIsExpanded.value) {
    currentLimit.value = LINKED_PRODUCTIONS_LIMIT;
  } else {
    currentLimit.value = totalLinkedProductions.value;
  }
};

/** Fetch linked productions using the blog_id filter */
const { data: linkedProductions, status: productionsStatus } = useAsyncData(
  `blog-productions-${blogId.value}-${locale.value}`,
  async () => {
    if (!blogId.value) return [];

    try {
      const resp = await getProductions({
        productionFilters: {
          blog_id: blogId.value,
        },
        paginationFilters: {
          page: 0,
          limit: currentLimit.value,
          descending: false,
        },
        languageFilters: {
          lang: locale.value as any,
        },
      });

      const unwrapped = (resp as any)?.data ?? resp;
      totalLinkedProductions.value = unwrapped?.totalItems ?? 0;
      return unwrapped?.objects ?? [];
    } catch (err) {
      console.error("Failed to load related productions:", err);
      return [];
    }
  },
  { watch: [blogId, locale, currentLimit], default: () => [] },
);

// Derived values
const { title, description: body, formattedDate } = useBlogStory(blog);

/** Header crop used in the hero section. */
const headerCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "FE3_header");
});

/**
 * Credits string extracted from the first media item in the gallery.
 */
const imageCredits = computed<string>(() => {
  const firstItem = gallery.value?.items?.[0] as MediaItemView | undefined;
  if (!firstItem?.credits) return "";

  if (typeof firstItem.credits === "string") return firstItem.credits;

  const obj = firstItem.credits as { nl?: string; en?: string };
  return obj[locale.value as "nl" | "en"] ?? obj.nl ?? "";
});

/** Estimated reading time in minutes (200 wpm). */
const readingTime = computed(() => {
  if (!body.value) return 0;
  const words = body.value.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

/** Sanitised rich-text body ready for v-html. */
const cleanBody = computed(() => cleanText(body.value));
</script>

<template>
  <BlogsStorySkeleton v-if="status === 'pending'" />

  <main
    v-else-if="blog"
    class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100"
  >
    <div
      v-if="error || !blog"
      class="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4"
    >
      <p
        class="font-brand font-black text-4xl uppercase italic tracking-tighter text-gray-300 dark:text-gray-600"
      >
        {{ t("stories.notFound") }}
      </p>
      <NuxtLink
        :to="ROUTES.stories.base"
        class="font-brand font-black text-[10px] uppercase tracking-widest border px-5 py-3 border-gray-300"
      >
        ← {{ t("general.back") }}
      </NuxtLink>
    </div>

    <template v-else>
      <DetailHero
        :id="blog.id"
        :title="title"
        :subtitle="formattedDate"
        :header-crop="headerCrop"
        :back-text="t('general.back')"
        @back="goBack"
      >
        <template #meta>
          <span
            :class="headerCrop ? 'text-white' : 'text-foreground'"
            class="text-[9px] font-black uppercase tracking-widest opacity-60"
          >
            {{ readingTime }} {{ t("stories.minRead") }}
          </span>
        </template>
      </DetailHero>

      <section class="pt-20 pb-10">
        <div class="page-container">
          <article class="relative w-full">
            <div
              class="hidden md:block absolute left-0 top-0 bottom-0 w-[2px] opacity-70"
              style="
                background: linear-gradient(
                  to bottom,
                  transparent,
                  #9333ea,
                  transparent
                );
              "
              aria-hidden="true"
            />

            <div class="md:pl-10 w-full">
              <div
                class="description-content text-lg lg:text-xl leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200"
                v-html="cleanBody"
              />

              <div
                v-if="imageCredits"
                class="mt-12 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3"
              >
                <svg
                  class="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="13" r="4" stroke-linecap="round" />
                </svg>
                <p
                  class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground/70 leading-relaxed"
                >
                  {{ imageCredits }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section
        v-if="productionsStatus === 'pending' && linkedProductions.length === 0"
        class="page-container py-10 flex justify-center"
      >
        <svg
          class="w-6 h-6 animate-spin text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 12a9 9 0 1 1-6.219-8.56"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
      </section>

      <section
        v-else-if="linkedProductions && linkedProductions.length > 0"
        class="page-container pb-14 border-t border-gray-200 dark:border-[#2e3347] pt-10"
      >
        <div class="w-full">
          <div class="mb-6">
            <h2 class="subtitle">
              {{ t("stories.relatedProductions") }}
            </h2>
          </div>

          <div
            class="flex flex-col gap-4 mb-6 transition-all duration-500 ease-in-out"
          >
            <ProductionListViewItem
              v-for="production in linkedProductions"
              :key="production.id"
              :productionView="production"
              :is-admin="false"
            />
          </div>

          <div v-if="hasHiddenProductions" class="flex justify-center mt-10">
            <button
              @click="toggleProductionsLimit"
              :disabled="productionsStatus === 'pending'"
              class="text-[11px] font-black uppercase tracking-[2px] text-accent hover:underline outline-none flex items-center gap-2 disabled:opacity-50"
            >
              <template v-if="productionsStatus === 'pending'">
                {{ t("stories.loading") }}
              </template>
              <template v-else-if="!productionListIsExpanded">
                {{ t("general.showMore") }} ({{
                  totalLinkedProductions - LINKED_PRODUCTIONS_LIMIT
                }})
                <ChevronDown :size="14" stroke-width="3" />
              </template>
              <template v-else>
                {{ t("general.showLess") }}
                <ChevronUp :size="14" stroke-width="3" />
              </template>
            </button>
          </div>
        </div>
      </section>

      <section class="pb-20">
        <div class="page-container">
          <div class="w-full">
            <div
              class="pt-8 border-t flex items-center justify-between border-gray-200 dark:border-[#2e3347]"
            >
              <span
                class="font-brand font-black text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500"
              >
                {{ formattedDate }}
              </span>
              <NuxtLink
                :to="ROUTES.stories.base"
                class="flex items-center gap-1.5 px-4 py-2 rounded border font-brand font-black text-[9px] uppercase tracking-widest transition-all duration-150 border-gray-300 text-gray-600 hover:text-accent dark:border-[#2e3347] dark:text-gray-400"
              >
                <ChevronLeft :size="12" /> {{ t("general.back") }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
/* Rich-text body styles */
.description-content :deep(a) {
  text-decoration: underline;
  text-underline-offset: 4px;
  color: var(--accent);
  overflow-wrap: break-word;
  word-wrap: break-word;
  transition: color 0.15s;
}
.description-content :deep(a:hover) {
  opacity: 0.7;
}
.description-content :deep(h1) {
  font-size: 1.75rem;
  font-weight: 900;
  margin: 1.5rem 0 0.5rem;
  line-height: 1.2;
}
.description-content :deep(h2) {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 1.25rem 0 0.4rem;
  line-height: 1.25;
}
.description-content :deep(h3) {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 1rem 0 0.3rem;
}
.description-content :deep(p) {
  margin: 0.75rem 0;
}
.description-content :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}
.description-content :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}
.description-content :deep(li) {
  margin: 0.25rem 0;
}
.description-content :deep(blockquote) {
  border-left: 3px solid #9333ea;
  padding: 0.25rem 0 0.25rem 1rem;
  margin: 1rem 0;
  color: #6b7280;
  font-style: italic;
}
:global(.dark) .description-content :deep(blockquote) {
  color: #9ca3af;
}
.description-content :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}
:global(.dark) .description-content :deep(hr) {
  border-top-color: #374151;
}
.description-content :deep(strong) {
  font-weight: 700;
}
.description-content :deep(em) {
  font-style: italic;
}
.description-content :deep(s) {
  text-decoration: line-through;
}
.description-content :deep(u) {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
