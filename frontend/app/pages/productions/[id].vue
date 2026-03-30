<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import type { ProductionView, TagView } from "@repo/common"

const { locale } = useI18n()
const route = useRoute()
const { getById, getTags } = useProductionApi()

/** 1. ID uit de URL halen */
const productionId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const n = parseInt(raw ?? "", 10)
  return isFinite(n) ? n : null
})

/** 2. Productie ophalen (Vertaald door backend) */
const { data: production, pending: prodPending } = await useAsyncData<ProductionView>(
  `prod-v3-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return null
    const res = await getById(productionId.value, locale.value as any)
    return (res as any)?.data ?? res
  },
  { watch: [productionId, locale] }
)

/** 3. Tags ophalen via je nieuwe functie */
const { data: tags, pending: tagsPending } = await useAsyncData<TagView[]>(
  `prod-tags-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return []
    const res = await getTags(productionId.value, locale.value as any)
    return (res as any)?.data ?? res ?? []
  },
  { watch: [productionId, locale] }
)

/** 4. Layout helpers */
const image = computed(() => (production.value as any)?.image ?? null)
const bannerGradient = computed(() => pickPlaceholderGradient(productionId.value ?? 0))
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100 transition-colors duration-200">

    <div v-if="prodPending" class="h-screen flex items-center justify-center">
      <div class="animate-pulse font-brand font-black uppercase opacity-20">Laden...</div>
    </div>

    <template v-else-if="production">
      <section
        class="relative h-[450px] lg:h-[550px] w-full flex items-end bg-neutral-900 overflow-hidden"
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
            <h1 class="text-6xl lg:text-8xl font-black uppercase leading-[0.85] tracking-[-3px] mb-4 italic">
              {{ production.titel }}
            </h1>
            <p class="text-2xl lg:text-3xl font-medium opacity-90">
              {{ production.artist || production.titel }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3 mt-8">
            <template v-if="!tagsPending">
              <span
                v-for="tag in tags"
                :key="tag.id"
                class="bg-[var(--accent)] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[1px]"
              >
                {{ tag.name }}
              </span>
            </template>
          </div>
        </div>
      </section>

      <section class="mx-auto w-full max-w-[1400px] px-6 lg:px-12 2xl:px-[120px] py-20">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div class="lg:col-span-8">
            <h2 class="text-3xl lg:text-4xl font-black uppercase mb-10 tracking-tight">
              Beschrijving
            </h2>
            <div class="text-lg lg:text-xl leading-relaxed opacity-80 font-brand whitespace-pre-line text-gray-700 dark:text-gray-300">
              {{ production.description1 }}
            </div>

            <div v-if="production.description2" class="mt-8 text-lg opacity-80 font-brand italic">
              {{ production.description2 }}
            </div>
          </div>

          <div v-if="production.credits" class="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 pt-10 lg:pt-0 lg:pl-10">
            <dt class="text-[10px] uppercase font-black opacity-40 mb-2">Credits</dt>
            <dd class="text-sm leading-relaxed opacity-80 whitespace-pre-line">
              {{ production.credits }}
            </dd>
          </div>
        </div>

        <div class="mt-24">
          <h2 class="text-3xl lg:text-4xl font-black uppercase mb-10 tracking-tight">
            Evenementen
          </h2>
          <div class="border-t-4 border-black dark:border-white"></div>
        </div>
      </section>
    </template>

    <div v-else class="h-screen flex items-center justify-center font-black uppercase opacity-20">
      Productie niet gevonden
    </div>
  </div>
</template>