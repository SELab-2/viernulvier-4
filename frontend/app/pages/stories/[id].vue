<!--
  pages/stories/[id].vue
  ========================
  Fetches a single blog post by ID with the current locale so the backend
  returns a flat BlogView. Renders the HTML description from the rich-text
  editor, including blue links, colors, headings, lists etc.
-->
<script lang="ts" setup>
import { ChevronLeft } from "lucide-vue-next";
import type { BlogView } from "@repo/common";
import { cleanText } from "~/utils/formatters";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogStory } from "~/composables/blogs/useBlogStory";
import { useGallery } from "~/composables/media/useGallery";
import { ROUTES } from "~/utils/routes";

const route = useRoute();
const { t, locale } = useI18n();
const { getMainImageCrop } = useGallery();
const { getById, getMediaGallery } = useBlogApi();

const blogId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

/** Get the main blog data and handle API nesting */
const { data, pending, error } = await useAsyncData<BlogView | null>(
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

const blog = computed(() => data.value);

/** Get the media gallery. */
const { data: gallery } = await useAsyncData(
  `blog-gallery-${blogId.value}-${locale.value}`,
  async () => {
    if (!blogId.value) return null;
    const res = await getMediaGallery(blogId.value, locale.value);
    return (res as any)?.data ?? res;
  },
  { watch: [blogId, locale] },
);

const { title, description: body, formattedDate } = useBlogStory(blog);

const headerCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "FE3_header");
});

const readingTime = computed(() => {
  if (!body.value) return 0;
  const words = body.value.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

const cleanBody = computed(() => cleanText(body.value));
</script>

<template>
  <main
    v-if="blog"
    class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100"
  >
    <!-- Loading -->
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
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
        class="font-brand font-black text-[10px] uppercase tracking-widest border px-5 py-3 border-gray-300"
      >
        ← {{ t("general.back") }}
      </NuxtLink>
    </div>

    <template v-else>
      <!-- ── Hero banner ─────────────────────────────────────────── -->
      <section
        class="relative h-[400px] lg:h-[500px] w-full flex items-end overflow-hidden bg-muted"
        :class="{ 'image-overlay text-white': headerCrop }"
      >
        <MediaDisplay
          v-if="blog.id"
          class="absolute inset-0 w-full h-full object-cover z-0"
          :id="blog.id"
          :src="headerCrop"
        />

        <div
          class="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20 pb-12"
        >
          <div class="flex items-center gap-6 mb-8">
            <NuxtLink
              :to="ROUTES.stories.base"
              class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] hover:text-accent transition-colors"
              :class="headerCrop ? 'text-white' : 'text-foreground'"
            >
              <ChevronLeft :size="14" stroke-width="3" />
              {{ t("general.back") }}
            </NuxtLink>

            <span
              class="text-[9px] font-black uppercase tracking-widest opacity-60"
              :class="headerCrop ? 'text-white' : 'text-foreground'"
            >
              {{ readingTime }} {{ t("stories.minRead") }}
            </span>
          </div>

          <div>
            <h1
              class="font-brand font-black uppercase leading-[0.85] tracking-[-3px] mb-4 italic"
              :class="[
                title.length > 35
                  ? 'text-4xl lg:text-6xl'
                  : title.length > 25
                    ? 'text-5xl lg:text-7xl'
                    : 'text-6xl lg:text-8xl',
              ]"
            >
              {{ title }}
            </h1>

            <p
              v-if="formattedDate"
              class="font-brand font-normal text-xl lg:text-2xl opacity-80 tracking-tight"
            >
              {{ formattedDate }}
            </p>
          </div>
        </div>
      </section>

      <section class="py-20">
        <div class="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20">
          <article class="relative w-full">
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

            <div class="md:pl-10 w-full">
              <div
                class="description-content text-lg lg:text-xl leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200"
                v-html="cleanBody"
              ></div>

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
/*
  Rich-text body styles — applied to .description-content which wraps
  HTML produced by the TipTap editor. The class name matches the template above.
*/

/* Links — blue + underline */
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

/* Headings */
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

/* Paragraphs */
.description-content :deep(p) {
  margin: 0.75rem 0;
}

/* Lists */
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

/* Blockquote */
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

/* Horizontal rule */
.description-content :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}
:global(.dark) .description-content :deep(hr) {
  border-top-color: #374151;
}

/* Inline formatting */
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
