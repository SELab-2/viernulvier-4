<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import type { ProductionView, TagView } from "@repo/common"

const { locale } = useI18n()
const route = useRoute()
const { getById, getTags } = useProductionApi()

const productionId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const n = parseInt(raw ?? "", 10)
  return isFinite(n) ? n : null
})

/** 1. Productie ophalen */
const { data: production, pending: prodPending } = await useAsyncData<ProductionView>(
  `prod-v3-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return null
    const res = await getById(productionId.value, locale.value as any)
    return (res as any)?.data ?? res
  },
  { watch: [productionId, locale] }
)

/** 2. Tags ophalen met opschoning */
const { data: tags } = await useAsyncData<TagView[]>(
  `prod-tags-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return []
    const res = await getTags(productionId.value, locale.value as any)
    const data = (res as any)?.data ?? res
    if (!Array.isArray(data)) return []
    return data.filter(t => (t.tag || "").trim().length > 1)
  },
  { watch: [productionId, locale] }
)

/** 3. Helper om "N/A" of lege velden te checken */
const isValid = (val: any) => {
  if (!val) return false
  const s = String(val).trim().toUpperCase()
  return s !== "" && s !== "N/A" && s !== "UNDEFINED"
}

const image = computed(() => (production.value as any)?.image ?? null)
const bannerGradient = computed(() => pickPlaceholderGradient(productionId.value ?? 0))

const cleanText = (text: string | null | undefined) => {
  if (!text) return ""

  return text
    .replace(/\\/g, '')
    .replace(/(\r?\n){3,}/g, '\n\n')
    .trim()
}
</script>

<template>
  <main v-if="production" class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100">

    <section
      class="relative h-[450px] lg:h-[550px] w-full flex items-end bg-neutral-900 overflow-hidden"
      :style="{ background: !image ? bannerGradient : '' }"
    >
      <img v-if="image" :src="image" class="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      <div class="relative z-10 mx-auto w-full max-w-[1400px] px-6 lg:px-12 2xl:px-[120px] pb-16 text-white">
        <div class="flex items-center gap-4 mb-8">
          <NuxtLink to="/archive" class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] hover:text-[var(--accent)] transition-colors">
            <ChevronLeft :size="14" stroke-width="3" /> Terug
          </NuxtLink>
          <span v-if="isValid(production.performer_type)" class="bg-white text-black px-2 py-1 text-[10px] font-black uppercase rounded-sm">
            {{ production.performer_type }}
          </span>
        </div>

        <div class="max-w-4xl">
          <h1 class="text-6xl lg:text-8xl font-black uppercase leading-[0.85] tracking-[-3px] mb-4 italic">
            {{ production.titel }}
          </h1>
          <p v-if="isValid(production.artist) && production.artist !== production.titel" class="text-2xl lg:text-3xl font-medium opacity-90">
            {{ production.artist }}
          </p>
        </div>

        <div v-if="tags?.length" class="flex flex-wrap gap-3 mt-8">
          <span v-for="tag in tags" :key="tag.id" class="bg-[var(--accent)] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[1px]">
            {{ tag.tag }}
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

          <div class="text-lg lg:text-xl leading-relaxed opacity-80 font-brand whitespace-pre-line text-gray-800 dark:text-gray-200">
            {{ cleanText(production.description1) }}
          </div>

          <div v-if="isValid(production.description2)" class="mt-12 p-6 border-l-2 border-gray-100 dark:border-gray-800 italic opacity-70 text-base lg:text-lg whitespace-pre-line">
            {{ cleanText(production.description2) }}
          </div>
        </div>

        <aside class="lg:col-span-4 space-y-10">
          <div v-if="isValid(production.tagline)" class="pb-6 border-b border-gray-100 dark:border-gray-800">
            <h4 class="text-[10px] uppercase font-black opacity-40 mb-3 tracking-widest">Tagline</h4>
            <p class="text-xl font-bold italic leading-tight uppercase">{{ production.tagline }}</p>
          </div>

          <div v-if="isValid(production.credits)">
            <h4 class="text-[10px] uppercase font-black opacity-40 mb-3 tracking-widest">Credits</h4>
            <div class="text-sm leading-relaxed opacity-80 whitespace-pre-line">
              {{ production.credits }}
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>