<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import type { ProductionView, TagView } from "@repo/common"
import EventTable from "../../components/production/EventTable.vue";

const { t, locale } = useI18n()
const router = useRouter()
const { getById, getTags} = useProductionApi()
const route = useRoute()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/productions') // Fallback
  }
}

const isExpanded = ref(false)
const CHARACTER_LIMIT = 800

const productionId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const n = parseInt(raw ?? "", 10)
  return isFinite(n) ? n : null
})

/** 1. Productie ophalen */
const { data: production} = await useAsyncData<ProductionView>(
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
  return s !== "" && s !== "N/A" && s !== "UNDEFINED" && s !== "\\N" && s !== "\N"
}

const image = computed(() => (production.value as any)?.image ?? null) //TODO verander! voeg iets toe in useProduction?
const bannerGradient = computed(() => pickPlaceholderGradient(productionId.value ?? 0))

const cleanText = (text: string | null | undefined) => {
  if (!text) return ""
  return text
    .replace(/\\/g, '')
    .trim()
    .replace(/(\r?\n){2,}/g, '\n\n')
    .replace(/\n/g, '<br />')
}


const fullDescription = computed(() => cleanText(production.value?.description1) || "")

const displayedDescription = computed(() => {
  const desc = fullDescription.value
  if (isExpanded.value || desc.length <= CHARACTER_LIMIT) {
    return desc
  }
  return desc.slice(0, CHARACTER_LIMIT) + '...'
})

const isLongDescription = computed(() => fullDescription.value.length > CHARACTER_LIMIT)

const { getAll: getAllEvents, getLocation, getPrices } = useEventApi()

const { data: events } = await useAsyncData(`events-detailed-${route.params.id}`, async () => {
  if (!productionId.value) return []

  const res = await getAllEvents({ eventFilters: { production_id: productionId.value } })
  const list = res.data?.objects ?? []

  if (!list.length) return []

  return Promise.all(list.map(async (e) => {
    const [locRes, priceRes] = await Promise.all([
      getLocation(e.id, locale.value as any).catch(() => null),
      getPrices(e.id, locale.value as any).catch(() => [])
    ])

    const locationData = (locRes as any)?.data ?? locRes
    const pricesData = (priceRes as any)?.data ?? priceRes ?? []

    return {
      ...e,
      location: locationData,
      prices: Array.isArray(pricesData) ? pricesData : []
    }
  }))
}, {
  watch: [productionId, locale],
  default: () => []
})

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
          <button @click="goBack()" class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] hover:text-[var(--accent)] transition-colors">
            <ChevronLeft :size="14" stroke-width="3" />
            {{ t('general.back')}}
          </button>
          <span v-if="isValid(production.performer_type)" class="bg-white text-black px-2 py-1 text-[10px] font-black uppercase rounded-sm">
            {{ production.performer_type }}
          </span>
        </div>

        <div class="max-w-4xl">
          <h1 class="font-brand text-6xl lg:text-8xl font-black uppercase leading-[0.85] tracking-[-3px] mb-4 italic">
            {{ production.titel }}
          </h1>
          <p v-if="isValid(production.artist) && production.artist !== production.titel" class="text-2xl lg:text-3xl font-medium opacity-90">
            {{ production.artist }}
          </p>
        </div>

        <div v-if="tags?.some(t => isValid(t.tag))" class="flex flex-wrap gap-3 mt-8">
          <template v-for="tag in tags" :key="tag.id">
            <span v-if="isValid(tag.tag)" class="bg-[var(--accent)] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[1px]">
              {{ tag.tag }}
            </span>
          </template>
        </div>
      </div>
    </section>

    <section class="mx-auto w-full max-w-[1400px] px-6 lg:px-12 2xl:px-[120px] py-20">
      <div class="max-w-5xl">

        <div v-if="isValid(production.tagline)" class="mb-10">
          <p class="border-l-4 border-[var(--accent)] pl-6 text-xl lg:text-2xl font-black italic leading-relaxed text-gray-900 dark:text-white">
            {{ production.tagline }}
          </p>
        </div>

        <div
          class="description-content text-lg lg:text-xl leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200"
          v-html="displayedDescription"
        ></div>

        <button
          v-if="isLongDescription"
          @click="isExpanded = !isExpanded"
          class="mt-6 mb-12 text-[11px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
        >
          {{ isExpanded ? t('general.readLess') : t('general.readMore') }}
        </button>

        <div class="my-16 -mx-4 lg:mx-0">
          <EventTable :events="events || []" />
        </div>

        <div
          v-if="isValid(production.description2)"
          class="description-content mb-16 p-8 bg-gray-50 dark:bg-white/5 border-l-2 border-gray-200 dark:border-gray-700 italic opacity-80 text-lg lg:text-xl"
          v-html="cleanText(production.description2)"
        ></div>

        <div v-if="isValid(production.credits)" class="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800">
          <h4 class="text-[10px] uppercase font-black opacity-40 mb-6 tracking-widest">
            {{ t('production.credits')}}
          </h4>
          <div class="text-sm leading-relaxed opacity-70 lg:columns-2 gap-12"
               v-html="production.credits"
          ></div>
        </div>

      </div>
    </section>
  </main>
</template>