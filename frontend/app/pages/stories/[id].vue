<script lang="ts" setup>
import type { Blog } from "@repo/common";
import { pickPlaceholderGradient } from "~/utils/constants";

const { t, locale } = useI18n();
const route = useRoute();
const { getById } = useBlogApi();

const blogId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

const { data, pending, error } = await useAsyncData<Blog | null>(
  `blog-${blogId.value}`,
  async (): Promise<Blog | null> => {
    if (blogId.value === null) return null;
    const res = await getById(blogId.value) as any;
    return (res?.data ?? res) as Blog;
  },
);

const blog = computed<Blog | null>(() => data.value ?? null);

const title = computed(() => {
  const raw = blog.value?.titel;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  const lang = locale.value as "nl" | "en";
  return raw[lang] ?? raw.nl ?? raw.en ?? "";
});

const body = computed(() => {
  const raw = blog.value?.description;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  const lang = locale.value as "nl" | "en";
  return raw[lang] ?? raw.nl ?? raw.en ?? "";
});

const image = computed<string | null>(() => (blog.value as any)?.image ?? null);

// Gradient for banner when no image
const bannerGradient = computed(() =>
  pickPlaceholderGradient(blog.value?.id ?? 0),
);

const formattedDate = computed(() => {
  if (!blog.value?.created_at) return "";
  const loc = locale.value === "nl" ? "nl-BE" : "en-GB";
  return new Date(blog.value.created_at).toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const readingTime = computed(() => {
  const words = body.value.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});
</script>

<template>
  <div class="min-h-screen blog-page text-foreground">

    <!-- Loading -->
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <svg class="w-6 h-6 animate-spin text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>

    <!-- Not found -->
    <div v-else-if="error || !blog" class="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <p class="font-brand font-black text-4xl uppercase italic tracking-tighter text-foreground/20">
        {{ t("stories.notFound") }}
      </p>
      <NuxtLink
        to="/stories"
        class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground border border-border px-5 py-3 hover:border-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        ← {{ t("stories.backToStories") }}
      </NuxtLink>
    </div>

    <!-- Blog content -->
    <template v-else>

      <!-- Hero banner: real image OR gradient placeholder -->
      <section
        class="relative flex items-end"
        :class="image ? 'h-[58vh] min-h-[420px]' : 'h-56 min-h-[200px]'"
      >
        <!-- Real image -->
        <template v-if="image">
          <img :src="image" :alt="title" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        </template>

        <!-- Gradient placeholder banner -->
        <div
          v-else
          class="absolute inset-0"
          :style="{ background: bannerGradient }"
          aria-hidden="true"
        />

        <!-- Header content -->
        <div
          class="relative z-10 container mx-auto px-6 max-w-4xl w-full pb-10"
          :class="image ? 'text-white' : 'text-foreground'"
        >
          <NuxtLink
            to="/stories"
            class="inline-flex items-center gap-2 mb-6 font-brand font-black text-[10px] uppercase tracking-widest transition-opacity duration-150 opacity-70 hover:opacity-100"
            :class="image ? 'text-white' : 'text-muted-foreground'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {{ t("stories.backToStories") }}
          </NuxtLink>

          <h1
            class="font-brand font-black uppercase tracking-tighter leading-none mb-5"
            :class="image ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'"
          >
            {{ title }}
          </h1>

          <div
            class="flex flex-wrap items-center gap-5 font-brand font-black text-[10px] uppercase tracking-widest"
            :class="image ? 'text-white/70' : 'text-muted-foreground'"
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

      <!-- Body -->
      <section class="py-20">
        <div class="container mx-auto px-6 max-w-4xl">
          <article class="relative max-w-3xl mx-auto">
            <div
              class="hidden md:block absolute left-0 top-0 bottom-0 w-px"
              style="background: linear-gradient(to bottom, transparent, var(--blog-year-rule), transparent)"
              aria-hidden="true"
            />
            <div class="md:pl-10">
              <p class="dropcap text-base leading-8 text-foreground/80 whitespace-pre-line">
                {{ body }}
              </p>
              <div class="mt-20 pt-8 border-t border-border flex items-center justify-between text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground">
                <span>{{ formattedDate }}</span>
                <NuxtLink to="/stories" class="hover:text-foreground transition-colors">
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