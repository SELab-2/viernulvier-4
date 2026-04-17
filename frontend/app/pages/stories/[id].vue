<!--
  pages/stories/[id].vue
  ========================
  Fetches a single blog post by ID with the current locale so the backend
  returns a flat BlogView. Renders the HTML description from the rich-text
  editor, including blue links, colors, headings, lists etc.
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogStory } from "~/composables/blogs/useBlogStory";
import { useGallery } from "~/composables/media/useGallery";
import { ROUTES } from "~/utils/routes";

const route = useRoute();
const { t, locale } = useI18n();
const { getMainImageCrop } = useGallery();
const { getMediaGallery } = useBlogApi();

const blogId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

const { getById } = useBlogApi();

const { data, pending, error, refresh } = await useAsyncData<BlogView | null>(
  `blog-${blogId.value}`,
  async (): Promise<BlogView | null> => {
    if (blogId.value === null) return null;
    const res = (await getById(
      blogId.value,
      locale.value as "nl" | "en",
    )) as any;
    return (res?.data ?? res) as BlogView;
  },
);

const blog = computed<BlogView | null>(() => data.value ?? null);

const { title, description: body, formattedDate } = useBlogStory(blog);
const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const headerCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "FE3_header");
});

const readingTime = computed(() => {
  // Strip HTML tags for word count
  const plain = body.value.replace(/<[^>]*>/g, " ").trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

async function loadGallery() {
  if (!blog.value) return;
  gallery.value = await getMediaGallery(blog.value.id, locale.value);
}

watch(locale, () => refresh());

onMounted(() => loadGallery());
watch(
  () => blog.value,
  () => loadGallery(),
);
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100 transition-colors duration-200"
  >
    <!-- Loading -->
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <svg
        class="w-6 h-6 animate-spin text-gray-400"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>

    <!-- Not found -->
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
        class="font-brand font-black text-[10px] uppercase tracking-widest border px-5 py-3 transition-all border-gray-300 text-gray-500 hover:border-gray-700 hover:text-gray-900 dark:border-[#2e3347] dark:text-gray-400 dark:hover:border-gray-400 dark:hover:text-gray-100"
      >
        ← {{ t("stories.backToStories") }}
      </NuxtLink>
    </div>

    <template v-else>
      <!-- ── Hero banner ─────────────────────────────────────────── -->
      <section
        class="relative flex items-end overflow-hidden"
        :class="headerCrop ? 'h-[52vh] min-h-[380px]' : 'h-52 min-h-[180px]'"
      >
        <MediaDisplay
          class="absolute inset-0 w-full h-full object-cover z-0"
          :id="blog.id"
          :src="headerCrop"
        />

        <div
          class="relative z-10 container mx-auto px-6 max-w-4xl w-full pb-10"
          :class="
            headerCrop ? 'text-white' : 'text-gray-900 dark:text-gray-100'
          "
        >
          <h1
            class="font-brand font-black uppercase tracking-tighter leading-none mb-5"
            :class="
              headerCrop ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'
            "
          >
            {{ title }}
          </h1>

          <div
            class="flex flex-wrap items-center justify-between gap-4 font-brand font-black text-[10px] uppercase tracking-widest"
            :class="
              headerCrop ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
            "
          >
            <!-- Date + reading time -->
            <div class="flex items-center gap-4">
              <span v-if="formattedDate" class="flex items-center gap-1.5">
                <svg
                  class="w-3.5 h-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {{ formattedDate }}
              </span>
              <span>{{ readingTime }} {{ t("stories.minRead") }}</span>
            </div>

            <!-- Back button -->
            <NuxtLink
              :to="ROUTES.stories.base"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all duration-150 font-brand font-black text-[9px] uppercase tracking-widest"
              :class="
                headerCrop
                  ? 'border-white/40 text-white/90 hover:border-white hover:bg-white/20'
                  : 'border-gray-400/60 text-gray-700 dark:border-gray-500/60 dark:text-gray-200 hover:border-gray-700 hover:bg-gray-100 dark:hover:border-gray-300 dark:hover:bg-white/10'
              "
            >
              <svg
                class="w-3 h-3 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {{ t("stories.backToStories") }}
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ── Body ──────────────────────────────────────────────── -->
      <section class="py-16 sm:py-20">
        <div class="container mx-auto px-6 max-w-4xl">
          <article class="relative max-w-3xl mx-auto">
            <!-- Decorative left line -->
            <div
              class="hidden md:block absolute left-0 top-0 bottom-0 w-px opacity-30"
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

            <div class="md:pl-10">
              <!--
                HTML from the rich-text editor.
                The `.story-body` scoped class handles all typography:
                blue links, headings, lists, blockquotes, etc.
                No @tailwindcss/typography plugin required.
              -->
              <div
                class="story-body text-base leading-8 text-gray-700 dark:text-gray-300 break-words"
                v-html="body"
              />

              <div
                class="mt-20 pt-8 border-t flex items-center justify-between border-gray-200 dark:border-[#2e3347]"
              >
                <span
                  class="font-brand font-black text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500"
                >
                  {{ formattedDate }}
                </span>

                <NuxtLink
                  :to="ROUTES.stories.base"
                  class="flex items-center gap-1.5 px-4 py-2 rounded border font-brand font-black text-[9px] uppercase tracking-widest transition-all duration-150 border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:border-[#2e3347] dark:text-gray-400 dark:hover:border-purple-500 dark:hover:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  <svg
                    class="w-3 h-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  {{ t("stories.backToStories") }}
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* ── Rich-text body typography ───────────────────────────────────────────
   Styles every element the TipTap editor can produce.
   Links are blue — no @tailwindcss/typography required.
   ──────────────────────────────────────────────────────────────────────── */

/* Links — blue + underline, the main fix for issue 4 */
.story-body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.15s;
  overflow-wrap: break-word;
  word-wrap: break-word;
}
.story-body :deep(a:hover) {
  color: #1d4ed8;
}

:global(.dark) .story-body :deep(a) {
  color: #60a5fa;
}
:global(.dark) .story-body :deep(a:hover) {
  color: #93c5fd;
}

/* Headings */
.story-body :deep(h1) {
  font-size: 1.75rem;
  font-weight: 900;
  margin: 1.5rem 0 0.5rem;
  line-height: 1.2;
}
.story-body :deep(h2) {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 1.25rem 0 0.4rem;
  line-height: 1.25;
}
.story-body :deep(h3) {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 1rem 0 0.3rem;
}

/* Paragraphs */
.story-body :deep(p) {
  margin: 0.75rem 0;
}

/* Lists */
.story-body :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}
.story-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}
.story-body :deep(li) {
  margin: 0.25rem 0;
}

/* Blockquote */
.story-body :deep(blockquote) {
  border-left: 3px solid #9333ea;
  padding: 0.25rem 0 0.25rem 1rem;
  margin: 1rem 0;
  color: #6b7280;
  font-style: italic;
}
:global(.dark) .story-body :deep(blockquote) {
  color: #9ca3af;
}

/* Horizontal rule */
.story-body :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}
:global(.dark) .story-body :deep(hr) {
  border-top-color: #374151;
}

/* Inline formatting */
.story-body :deep(strong) {
  font-weight: 700;
}
.story-body :deep(em) {
  font-style: italic;
}
.story-body :deep(s) {
  text-decoration: line-through;
}
.story-body :deep(u) {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
