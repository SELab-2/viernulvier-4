<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { ProductionView, Tag, Event } from '@repo/common'
import { useProductionApi } from '../composables/useProductionApi'
import { useEventApi } from '../composables/useEventApi'
import { ROUTES } from '../utils/routes'
import { computeDateRangeFromEvents } from '../utils/formatters'
import { useTagFit } from '../composables/useTagFit'
import TagPill from './TagPill.vue'
import ThumbnailPlaceholder from './ThumbnailPlaceholder.vue'

const { productionView } = defineProps<{
  productionView: ProductionView
}>()

const tags = ref<Tag[]>([])
const events = ref<Event[]>([])

const { getTags } = useProductionApi()
const { getAll: getAllEvents } = useEventApi()

const { tagsContainer, setTagRef, moreEl, fitCount, scheduleMeasure } = useTagFit()

function formatText(text: string | null) {
  if (!text) return ''
  return text.replace(/\+/g, '<br>')
}

const dateRangeText = computed(() => computeDateRangeFromEvents(events.value as any))

function getTagLabel(tag: any): string {
  if (!tag) return ''
  if (typeof tag.tag === 'string') return tag.tag
  if (typeof tag === 'string') return tag
  // localized object like { nl: 'x', en: 'y' }
  if (tag.tag && typeof tag.tag === 'object') {
    if (tag.tag.nl) return tag.tag.nl
    if (tag.tag.en) return tag.tag.en
    // fallback: pick first available
    const v = Object.values(tag.tag)[0]
    return typeof v === 'string' ? v : ''
  }
  // sometimes tag itself might be localized object
  if (tag.nl) return tag.nl
  if (tag.en) return tag.en
  return String((tag.tag ?? tag) || '')
}

async function loadTagsAndEvents() {
  if (productionView && productionView.id) {
    // load tags
    try {
      const response = await getTags(productionView.id, 'nl')
      if (response.data) tags.value = response.data as Tag[]
      else console.error('Failed to load tags:', response.error)
    } catch (err) {
      console.error('Error loading tags:', err)
    }

    // load events
    try {
      const resp = await getAllEvents({ production_id: productionView.id as any, limit: 100 })
      if (resp.data && Array.isArray((resp.data as any).objects)) {
        events.value = (resp.data as any).objects as Event[]
      } else {
        if (resp.data && Array.isArray(resp.data)) events.value = resp.data as Event[]
      }
    } catch (err) {
      console.error('Error loading events:', err)
    }

    scheduleMeasure()
  }
}

onMounted(() => loadTagsAndEvents())
watch(() => productionView.id, () => loadTagsAndEvents())
watch(() => tags.value.length, () => scheduleMeasure())
</script>

<template>
  <NuxtLink :to="ROUTES.productions.byId(productionView.id)" class="group block">
    <article class="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm hover:bg-zinc-50/10 transition-colors transition-shadow duration-150" :aria-label="`${productionView.titel ?? 'Production'} — ${dateRangeText}`">

      <ThumbnailPlaceholder :id="productionView.id" size="md" :showIcon="true" />

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-3xl sm:text-4xl font-semibold text-zinc-900 leading-tight truncate" v-html="formatText(productionView.titel)" :title="productionView.titel || ''" />

            <p class="mt-2 text-sm text-zinc-500 flex items-center gap-2">
              <svg class="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ dateRangeText }}</span>
            </p>
          </div>
        </div>

        <div class="mt-2" ref="tagsContainer">
          <div class="flex items-center gap-2 overflow-hidden">
            <TagPill v-for="(tag, idx) in tags" :key="tag.id" :ref="el => setTagRef(el, idx)" v-show="idx < fitCount" :label="getTagLabel(tag)" />

            <span v-if="(tags.length - fitCount) > 0" class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-600">+{{ tags.length - fitCount }} more</span>

            <span ref="moreEl" class="absolute left-[-9999px] top-[-9999px] inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-600">+99 more</span>
          </div>

          <div v-if="!tags.length" class="text-sm text-zinc-400">No tags</div>
        </div>
      </div>

    </article>
  </NuxtLink>
</template>

<style scoped>
[tabindex="0"]:focus { outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12); }
.group:hover { text-decoration: none; }
</style>
