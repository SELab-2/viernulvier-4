<script setup lang="ts">

import type { Production } from "@repo/common";
const { t, locale } = useI18n();
const route = useRoute();
const { getById } = useProductionApi();

/** Parse the route parameter to a numeric id, or null if invalid. */
const productionId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

const { data, pending, error } = await useAsyncData<Production | null>(
  `production-${productionId.value}`,
  async (): Promise<Production | null> => {
    if (productionId.value === null) return null;
    const res = await getById(productionId.value) as any;
    return (res?.data ?? res) as Production;
  },
  { watch: [productionId] }
);

const production = computed<Production | null>(() => data.value ?? null);

const translate = (field: Record<"nl" | "en", string> | string | null | undefined) => {
  if (!field) return "";
  if (typeof field === "string") return field;

  const lang = locale.value as "nl" | "en";
  return field[lang] ?? field.nl ?? field.en ?? "";
};

const content = computed(() => {
  const p = production.value;
  return {
    title: translate(p?.titel),
    description1: translate(p?.description1),
    description2: translate(p?.description2),
    artist: translate(p?.artist),
    tagline: translate(p?.tagline),
    credits: translate(p?.credits)
    // performer_type, attendance_mode?
  };
});

const image = computed<string | null>(() => (production.value as any)?.image ?? null);
const bannerGradient = computed(() => pickPlaceholderGradient(production.value?.id ?? 0));
const tags = ['concert', 'alternatief', 'indie'];

</script>

<template>
  <main v-if="production" class="min-h-screen bg-[var(--background)]">

    <section
      class="relative h-[450px] lg:h-[550px] w-full flex items-end bg-neutral-900"
      :style="{ background: !image ? bannerGradient : '' }"
    >
      <img
        v-if="image"
        :src="image"
        class="absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      <div class="relative z-10 mx-auto w-full max-w-[1400px] px-6 lg:px-12 2xl:px-[120px] pb-16 text-white">

        <div class="flex items-center gap-4 mb-8">
          <NuxtLink to="/archive" class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] hover:text-[var(--accent)] transition-colors">
            <ChevronLeft :size="14" stroke-width="3" />
            Terug
          </NuxtLink>
          <span class="bg-white text-black px-2 py-1 text-[10px] font-black uppercase rounded-sm">
            {{ production.performer_type || 'Muziek' }}
          </span>
        </div>

        <div class="max-w-4xl">
          <h1 class="text-6xl lg:text-8xl font-black uppercase leading-[0.85] tracking-[-3px] mb-4">
            {{ content.title }}
          </h1>
          <p class="text-2xl lg:text-3xl font-medium opacity-90">
            {{ content.artist || content.title }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3 mt-8">
          <span
            v-for="tag in ['concert', 'alternatief', 'indie']"
            :key="tag"
            class="bg-[var(--accent)] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[1px]"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </section>

    <section class="mx-auto w-full max-w-[1400px] px-6 lg:px-12 2xl:px-[120px] py-20">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div class="lg:col-span-8">
          <h2 class="text-3xl lg:text-4xl font-black uppercase mb-10 tracking-tight">
            Beschrijving
          </h2>
          <div class="text-lg lg:text-xl leading-relaxed opacity-80 font-brand">
            {{ content.description1 }}
          </div>

          <div v-if="content.description2" class="mt-8 text-lg opacity-80 font-brand">
            {{ content.description2 }}
          </div>
        </div>
      </div>

      <div class="mt-24">
        <h2 class="text-3xl lg:text-4xl font-black uppercase mb-10 tracking-tight">
          Evenementen
        </h2>
        <div class="border-t-4 border-black dark:border-white">
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Optionele extra styling voor de beschrijving */
.prose {
  font-family: var(--font-brand);
}
</style>