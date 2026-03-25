<script lang="ts" setup>
import type { Blog } from "@repo/common";

const { t, locale } = useI18n();
const route = useRoute();
const { getById } = useBlogApi();

const mockStories = useState<Array<Blog>>("mock-stories", () => []);

const blogId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

const isMock = computed(() => (blogId.value ?? 0) < 0);

const { data, pending, error } = await useAsyncData<Blog | null>(
  `blog-${blogId.value}`,
  (): Promise<Blog | null> => {
    if (blogId.value === null) return Promise.resolve(null);
    if (isMock.value) {
      return Promise.resolve(
        mockStories.value.find((s) => s.id === blogId.value) ?? null,
      );
    }
    // Oplossing: Haal de data uit het mogelijke wrapper object
    return getById(blogId.value).then((res: any) => {
      const actualData = res?.data ?? res;
      return actualData as Blog;
    });
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

const formattedDate = computed(() => {
  if (!blog.value?.created_at) return "";
  return new Date(blog.value.created_at).toLocaleDateString(
    t("stories.locale"),
    { year: "numeric", month: "long", day: "numeric" },
  );
});

const readingTime = computed(() => {
  const words = body.value.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">

    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <svg class="w-6 h-6 animate-spin text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    </div>

    <div v-else-if="error || !blog" class="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <p class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-20">
        {{ t("stories.notFound") }}
      </p>
      <NuxtLink to="/generalStoryTest" class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground border border-border px-5 py-3 hover:border-foreground hover:text-foreground hover:bg-muted transition-all">
        ← {{ t("stories.backToStories") }}
      </NuxtLink>
    </div>

    <template v-else>
      <section class="relative flex items-end" :class="image ? 'h-[60vh] min-h-[460px]' : 'pt-24 pb-16 border-b border-border'">
        <template v-if="image">
          <img :src="image" :alt="title" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </template>

        <div class="relative z-10 container mx-auto px-6 max-w-4xl w-full" :class="image ? 'pb-14 text-white' : 'text-foreground'">
          <NuxtLink to="/generalStoryTest" class="inline-flex items-center gap-2 mb-8 font-brand font-black text-[10px] uppercase tracking-widest transition-opacity duration-150 opacity-70 hover:opacity-100" :class="image ? 'text-white' : 'text-muted-foreground'">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            {{ t("stories.backToStories") }}
          </NuxtLink>

          <h1 class="font-brand font-black uppercase tracking-tighter leading-none mb-6" :class="image ? 'text-4xl md:text-6xl' : 'text-4xl md:text-5xl text-foreground'">
            {{ title }}
          </h1>

          <div class="flex flex-wrap items-center gap-5 font-brand font-black text-[10px] uppercase tracking-widest" :class="image ? 'text-white/70' : 'text-muted-foreground'">
            <span v-if="formattedDate" class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {{ formattedDate }}
            </span>
            <span>{{ readingTime }} {{ t("stories.minRead") }}</span>
          </div>
        </div>
      </section>

      <section class="py-20 bg-background">
        <div class="container mx-auto px-6 max-w-4xl">
          <article class="relative max-w-3xl mx-auto">
            <div class="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden="true" />
            <div class="md:pl-10">
              <p class="dropcap text-base leading-8 text-foreground/80 whitespace-pre-line">
                {{ body }}
              </p>
              <div class="mt-20 pt-8 border-t border-border flex items-center justify-between text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground">
                <span>{{ formattedDate }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>