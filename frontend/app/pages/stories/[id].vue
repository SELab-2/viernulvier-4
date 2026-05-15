<!--
  pages/stories/[id].vue
  ========================
  Public single-blog-post page.

  Layout:
  1. Hero banner  — full-width image with scrollable/fading title overlay.
  2. Body article — rich-text content with a thin purple left accent line.
  3. Credits bar  — image credits fetched from the linked media item, shown
                    in a subtle strip at the bottom of the article when present.

  The title uses the same scrollable + fade pattern as the admin preview
  (AdminBlogsPreview.vue) so very long titles never overflow the hero section.

  Data fetching:
  - Blog data    : useBlogApi().getById  (lang-aware, returns BlogView)
  - Gallery data : useBlogApi().getMediaGallery  (header crop + credits)
  Both use useAsyncData so they are SSR-compatible and react to locale changes.
-->
<script lang="ts" setup>
import { ChevronLeft } from "lucide-vue-next";
import type { BlogView, MediaItemView } from "@repo/common";
import { cleanText } from "~/utils/formatters";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useGallery } from "~/composables/media/useGallery";
import { ROUTES } from "~/utils/routes";
import { useBlogView } from "~/composables/blogs/useBlogView";

const route = useRoute();
const { t, locale } = useI18n();
const { getMainImageCrop } = useGallery();
const { getById, getMediaGallery } = useBlogApi();
const { useBlogStory } = useBlogView();

/** validation that id is only numbers */
definePageMeta({
  validate: async (route) => {
    const raw = Array.isArray(route.params.id)
      ? route.params.id[0]
      : route.params.id;
    return /^\d+$/.test(raw as string);
  },
});

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
  // Data fetching
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
    // Once the fetch finishes, check if it failed or returned nothing
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

// Derived values

const { title, description: body, formattedDate } = useBlogStory(blog);

/** Header crop used in the hero section. */
const headerCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "FE3_header");
});

/**
 * Credits string extracted from the first media item in the gallery.
 * The backend returns credits as a localised object { nl: string, en: string }
 * for raw MediaItem, or as a flat string for MediaItemView (when lang is passed).
 * We handle both shapes here.
 */
const imageCredits = computed<string>(() => {
  const firstItem = gallery.value?.items?.[0] as MediaItemView | undefined;
  if (!firstItem?.credits) return "";

  // Flat string (MediaItemView with lang param)
  if (typeof firstItem.credits === "string") return firstItem.credits;

  // Localised object (MediaItem without lang param, or mixed response)
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

/**
 * Show the fade mask once the title is long enough to risk overflowing
 * the fixed-height scroll wrapper in the hero section.
 */
const titleIsLong = computed(() => title.value.length > 50);

/**
 * Dynamic font-size class — same breakpoints as the production detail page
 * and the admin preview component so all contexts look consistent.
 */
const titleSizeClass = computed(() => {
  const len = title.value.length;
  return len > 35
    ? "text-4xl lg:text-6xl"
    : len > 25
      ? "text-5xl lg:text-7xl"
      : "text-6xl lg:text-8xl";
});

// Only allow scrolling of the title when it actually wraps onto more than one
// rendered line. This avoids showing a scrollbar for single-line titles.
const titleText = ref<HTMLElement | null>(null);
const titleScrollable = ref(false);
let __ro_title: ResizeObserver | null = null;

function updateTitleScrollable() {
  nextTick(() => {
    const el = titleText.value;
    if (!el) {
      titleScrollable.value = false;
      return;
    }

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "0");
    if (!lineHeight) {
      titleScrollable.value = false;
      return;
    }

    const lines = Math.round(el.scrollHeight / lineHeight);
    titleScrollable.value = lines > 1;
  });
}

onMounted(() => {
  updateTitleScrollable();
  __ro_title = new ResizeObserver(updateTitleScrollable);
  if (titleText.value) __ro_title.observe(titleText.value);
});

onBeforeUnmount(() => {
  __ro_title?.disconnect();
});

watch(title, updateTitleScrollable);
</script>

<template>
  <main
    v-if="blog"
    class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100"
  >
    <!-- Loading -->
    <div
      v-if="status === 'pending'"
      class="min-h-screen flex items-center justify-center"
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
    </div>

    <!-- Not found / error state -->
    <div
      v-else-if="error || !blog"
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

    <!-- Main content -->
    <template v-else>
      <!-- Hero banner -->
      <section
        :class="{ 'image-overlay text-white': headerCrop }"
        class="relative h-[400px] lg:h-[500px] w-full flex items-end overflow-hidden bg-muted"
      >
        <!-- Background image (lazy, 0-opacity placeholder when absent) -->
        <MediaDisplay
          v-if="blog.id"
          :id="blog.id"
          :src="headerCrop"
          class="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div class="relative z-10 page-container pb-12">
          <!-- Back link + reading time row -->
          <div class="flex items-center gap-6 mb-8">
            <NuxtLink
              :class="headerCrop ? 'text-white' : 'text-foreground'"
              :to="ROUTES.stories.base"
              class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] hover:text-accent transition-colors"
            >
              <ChevronLeft :size="14" stroke-width="3" />
              {{ t("general.back") }}
            </NuxtLink>

            <span
              :class="headerCrop ? 'text-white' : 'text-foreground'"
              class="text-[9px] font-black uppercase tracking-widest opacity-60"
            >
              {{ readingTime }} {{ t("stories.minRead") }}
            </span>
          </div>

          <!--
            Scrollable title container.
            max-height + overflow-y: long titles scroll instead of overflowing.
            The fade mask is applied when the title is long enough to be cut off.
          -->
          <div
            class="title-scroll-wrap mb-4"
            :class="[
              titleIsLong ? 'title-scroll-fade' : '',
              titleScrollable ? 'title-scroll-scrollable' : '',
            ]"
          >
            <h1
              ref="titleText"
              class="font-brand font-black uppercase leading-[0.85] tracking-[-3px] italic"
              :class="titleSizeClass"
            >
              {{ title }}
            </h1>
          </div>

          <!-- Publication date -->
          <p
            v-if="formattedDate"
            class="font-brand font-normal text-xl lg:text-2xl opacity-80 tracking-tight"
          >
            {{ formattedDate }}
          </p>
        </div>
      </section>

      <!-- Article body -->
      <section class="py-20">
        <div class="page-container">
          <article class="relative w-full">
            <!--
              Decorative vertical line on the left (md+).
              Uses a gradient so it fades in/out at the top and bottom.
            -->
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
              <!-- Rich-text content (sanitised HTML from the editor) -->
              <div
                class="description-content text-lg lg:text-xl leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200"
                v-html="cleanBody"
              />

              <!--
                Image credits bar — only shown when the linked media item has credits.
                Positioned at the bottom of the article, above the navigation footer.
              -->
              <div
                v-if="imageCredits"
                class="mt-12 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3"
              >
                <!-- Camera icon -->
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

              <!-- Article footer: date + back link -->
              <div
                class="mt-16 pt-8 border-t flex items-center justify-between border-gray-200 dark:border-[#2e3347]"
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
          </article>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
/* Scrollable hero title */
.title-scroll-wrap {
  max-width: 100%;
  max-height: 13rem; /* ≈ 3 lines at the largest font size */
  /* hide overflow by default; enable scrolling only when JS detects overflow */
  overflow-y: hidden;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.title-scroll-wrap h1 {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}
.title-scroll-wrap::-webkit-scrollbar {
  display: none;
}

/* When the title actually overflows the wrapper we enable scrolling */
.title-scroll-scrollable {
  overflow-y: auto;
}

.title-scroll-scrollable::-webkit-scrollbar {
  display: block;
  width: 6px;
}

.title-scroll-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.title-scroll-scrollable::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}

/* Soft bottom fade for very long titles */
.title-scroll-fade {
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
}

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

/* Gradient overlay on the hero image */
.image-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
  pointer-events: none;
}
</style>
