<!--
  pages/blog/[id].vue
  =====================
  This file implements the individual blog post detail page.
  It fetches the blog post by ID from the backend API, then renders:
    - A hero banner (real image when available, gradient placeholder otherwise)
    - The post title, date and estimated reading time
    - The full post body with a decorative side rule

  Dark-mode approach
  ------------------
  The page uses explicit colour classes rather than relying on --background
  which can resolve to near-black in dark mode.  The body section uses a
  lighter surface (#151821 as the overall page bg, with the article on
  transparent so it inherits cleanly).  Text uses gray-100 / gray-300 shades
  so there is strong contrast without being harsh white-on-black.

  Routing
  -------
  The dynamic segment [id] is read from route.params.id.  Non-numeric IDs or
  a null result from the API redirect to the "not found" state.
-->

<script lang="ts" setup>
import type { Blog } from "@repo/common";
import { pickPlaceholderGradient } from "~/utils/constants";

const { t, locale } = useI18n();
const route = useRoute();
const { getById } = useBlogApi();

/** Parse the route parameter to a numeric id, or null if invalid. */
const blogId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

// Fetch the blog post; useAsyncData deduplicates the request during SSR.
const { data, pending, error } = await useAsyncData<Blog | null>(
  `blog-${blogId.value}`,
  async (): Promise<Blog | null> => {
    if (blogId.value === null) return null;
    const res = await getById(blogId.value) as any;
    return (res?.data ?? res) as Blog;
  },
);

const blog = computed<Blog | null>(() => data.value ?? null);

/** Extract the title for the active locale. */
const title = computed(() => {
  const raw = blog.value?.titel;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  const lang = locale.value as "nl" | "en";
  return raw[lang] ?? raw.nl ?? raw.en ?? "";
});

/** Extract the body text for the active locale. */
const body = computed(() => {
  const raw = blog.value?.description;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  const lang = locale.value as "nl" | "en";
  return raw[lang] ?? raw.nl ?? raw.en ?? "";
});

/** Real image URL from a future backend field, or null. */
const image = computed<string | null>(() => (blog.value as any)?.image ?? null);

/** Gradient banner used when no real image is available. */
const bannerGradient = computed(() => pickPlaceholderGradient(blog.value?.id ?? 0));

/** Localised date string. */
const formattedDate = computed(() => {
  if (!blog.value?.created_at) return "";
  const loc = locale.value === "nl" ? "nl-BE" : "en-GB";
  return new Date(blog.value.created_at).toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

/** Estimated reading time based on ~200 wpm, minimum 1 minute. */
const readingTime = computed(() => {
  const words = body.value.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});
</script>

<template>
  <!--
    Page root: light mode uses white bg, dark mode uses a mid-dark navy
    (#151821) that is noticeably lighter than pitch-black so text and elements
    retain clear contrast and layering.
  -->
  <div class="min-h-screen bg-white dark:bg-[#151821] text-gray-900 dark:text-gray-100 transition-colors duration-200">

    <!-- Loading spinner -->
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <svg class="w-6 h-6 animate-spin text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>

    <!-- Not found / error state -->
    <div
      v-else-if="error || !blog"
      class="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4"
    >
      <p class="font-brand font-black text-4xl uppercase italic tracking-tighter text-gray-300 dark:text-gray-600">
        {{ t("stories.notFound") }}
      </p>
      <NuxtLink
        to="/stories"
        class="
          font-brand font-black text-[10px] uppercase tracking-widest
          border px-5 py-3 transition-all
          border-gray-300 text-gray-500 hover:border-gray-700 hover:text-gray-900
          dark:border-[#2e3347] dark:text-gray-400 dark:hover:border-gray-400 dark:hover:text-gray-100
        "
      >
        ← {{ t("stories.backToStories") }}
      </NuxtLink>
    </div>

    <!-- Blog content -->
    <template v-else>

      <!-- ── Hero banner ─────────────────────────────────────────────────── -->
      <section
        class="relative flex items-end"
        :class="image ? 'h-[52vh] min-h-[380px]' : 'h-52 min-h-[180px]'"
      >
        <!-- Real hero image with dark gradient overlay -->
        <template v-if="image">
          <img :src="image" :alt="title" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </template>

        <!-- Gradient placeholder when no image -->
        <div
          v-else
          class="absolute inset-0 opacity-60"
          :style="{ background: bannerGradient }"
          aria-hidden="true"
        />

        <!-- Title + meta overlaid on the banner -->
        <div
          class="relative z-10 container mx-auto px-6 max-w-4xl w-full pb-10"
          :class="image ? 'text-white' : 'text-gray-900 dark:text-gray-100'"
        >
          <!-- Back link -->
          <NuxtLink
            to="/stories"
            class="
              inline-flex items-center gap-2 mb-6
              font-brand font-black text-[10px] uppercase tracking-widest
              transition-opacity duration-150 opacity-70 hover:opacity-100
            "
            :class="image ? 'text-white' : 'text-gray-500 dark:text-gray-400'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {{ t("stories.backToStories") }}
          </NuxtLink>

          <!-- Title -->
          <h1
            class="font-brand font-black uppercase tracking-tighter leading-none mb-5"
            :class="image ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'"
          >
            {{ title }}
          </h1>

          <!-- Date + reading time -->
          <div
            class="flex flex-wrap items-center gap-5 font-brand font-black text-[10px] uppercase tracking-widest"
            :class="image ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'"
          >
            <span v-if="formattedDate" class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {{ formattedDate }}
            </span>
            <span>{{ readingTime }} {{ t("stories.minRead") }}</span>
          </div>
        </div>
      </section>

      <!-- ── Body ────────────────────────────────────────────────────────── -->
      <!--
        The body section sits on a slightly raised surface in dark mode
        (#1a1e2b) so it reads as a distinct "content card" against the darker
        page background.  The subtle top border anchors the transition from
        the banner above.
      -->
      <section
        class="
          py-16 sm:py-20
          bg-white dark:bg-[#1a1e2b]
          border-t border-gray-100 dark:border-[#252a3a]
        "
      >
        <div class="container mx-auto px-6 max-w-4xl">
          <article class="relative max-w-3xl mx-auto">

            <!-- Decorative left rule (desktop only) -->
            <div
              class="hidden md:block absolute left-0 top-0 bottom-0 w-px opacity-30"
              style="background: linear-gradient(to bottom, transparent, #9333ea, transparent)"
              aria-hidden="true"
            />

            <div class="md:pl-10">
              <!-- Post body text -->
              <p class="text-base leading-8 whitespace-pre-line text-gray-700 dark:text-gray-300">
                {{ body }}
              </p>

              <!-- Footer: date + back link -->
              <div
                class="
                  mt-20 pt-8 border-t flex items-center justify-between
                  text-[9px] font-brand font-black uppercase tracking-widest
                  border-gray-200 dark:border-[#2e3347]
                  text-gray-400 dark:text-gray-500
                "
              >
                <span>{{ formattedDate }}</span>
                <NuxtLink
                  to="/stories"
                  class="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  {{ t("stories.backToStories") }} →
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>
      </section>

    </template>
  </div>
</template>