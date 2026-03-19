<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { ProductionView, Tag, Event } from '@repo/common'
import { useProductionApi } from '../composables/useProductionApi'
import { useEventApi } from '../composables/useEventApi'
import { ROUTES } from '../utils/routes'

const { productionView } = defineProps<{
  productionView: ProductionView
}>()

const tags = ref<Tag[]>([])
const events = ref<Event[]>([])
const tagsLimit = 3

const { getTags } = useProductionApi()
const { getAll: getAllEvents } = useEventApi()

// Read gradients from CSS variables exposed in tailwind.css
function gradientForId(id?: number) {
  const fallback = 'linear-gradient(135deg, rgba(130,36,227,0.12), rgba(255,159,102,0.10))'
  try {
    if (typeof document === 'undefined') return fallback
    const root = document.documentElement

    // Try to read the count from CSS custom property so the list is maintained in CSS
    let count = 5 // default fallback
    try {
      const countRaw = getComputedStyle(root).getPropertyValue('--placeholder-grad-count')
      const parsed = parseInt(countRaw?.trim() || '', 10)
      if (!Number.isNaN(parsed) && parsed > 0) count = parsed
    } catch (e) {
      // ignore and use default
    }

    const idx = (id != null && Number.isInteger(id)) ? Math.abs(id) % count : 0
    const prop = `--placeholder-grad-${idx}`
    const val = getComputedStyle(root).getPropertyValue(prop)
    if (val && val.trim()) return val.trim()
    // fallback: find first defined gradient
    for (let i = 0; i < count; i++) {
      const v = getComputedStyle(root).getPropertyValue(`--placeholder-grad-${i}`)
      if (v && v.trim()) return v.trim()
    }
    return fallback
  } catch (e) {
    return fallback
  }
}

function formatText(text: string | null) {
  if (!text) return ''
  return text.replace(/\\+/g, '<br>')
}

function formatDateShort(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch (e) {
    return ''
  }
}

const dateRangeText = computed(() => {
  if (!events.value.length) return 'TBA'

  // parse dates and compute earliest start and latest end (fallback to start)
  const starts = events.value
    .map((e) => (e.starttime ? new Date(e.starttime).getTime() : NaN))
    .filter((t) => !Number.isNaN(t))
  const ends = events.value
    .map((e) => (e.endtime ? new Date(e.endtime).getTime() : NaN))
    .map((t, i) => (Number.isNaN(t) ? (events.value[i]?.starttime ? new Date(events.value[i]!.starttime).getTime() : NaN) : t))
    .filter((t) => !Number.isNaN(t))

  if (!starts.length) return 'TBA'

  const earliest = new Date(Math.min(...starts))
  const latest = new Date(Math.max(...ends))

  // if same day show single date
  const sameDay = earliest.toDateString() === latest.toDateString()
  if (sameDay) return formatDateShort(earliest.toISOString())

  return `${formatDateShort(earliest.toISOString())} — ${formatDateShort(latest.toISOString())}`
})

const displayTags = computed(() => tags.value.slice(0, tagsLimit))
const overflowCount = computed(() => Math.max(0, tags.value.length - tagsLimit))

// accentRgb fetched on mounted (safe for SSR)
const accentRgb = ref('130, 36, 227')
const tagStyle = computed(() => ({
  background: `rgba(${accentRgb.value}, 0.08)`,
  color: 'var(--accent)'
}))

onMounted(() => {
  // read CSS variable if available in browser
  if (typeof window !== 'undefined' && document?.documentElement) {
    try {
      const val = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb')
      if (val && val.trim().length > 0) accentRgb.value = val.trim()
    } catch (e) {
      // ignore
    }
  }
})

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

    // load events (fetch a reasonable number; backend limits to max 100)
    try {
      const resp = await getAllEvents({ production_id: productionView.id as any, limit: 100 })
      if (resp.data && Array.isArray((resp.data as any).objects)) {
        events.value = (resp.data as any).objects as Event[]
      } else {
        // fallback: if API returns array directly
        if (resp.data && Array.isArray(resp.data)) events.value = resp.data as Event[]
      }
    } catch (err) {
      console.error('Error loading events:', err)
    }
  }
}

onMounted(() => loadTagsAndEvents())
watch(() => productionView.id, () => loadTagsAndEvents())
</script>

<template>
  <NuxtLink
    :to="ROUTES.productions.byId(productionView.id)"
    class="group block"
  >
    <article
      class="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm hover:bg-zinc-50/10 transition-colors transition-shadow duration-150"
      :aria-label="`${productionView.titel ?? 'Production'} — ${dateRangeText}`"
    >

      <!-- Thumbnail placeholder: reduced size with no pop effect -->
      <div
        class="thumbnail shrink-0 w-48 h-32 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-300"
        :style="{ background: gradientForId(productionView.id) }"
      >
        <div class="w-full h-full flex items-center justify-center text-white">
          <!-- clear icon on top -->
          <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M3 15l4-4 6 6 4-5 4 5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">

        <div class="flex items-start justify-between gap-3">
          <!-- Title + date -->
          <div class="min-w-0">
            <h3
              class="text-3xl sm:text-4xl font-semibold text-zinc-900 leading-tight truncate"
              v-html="formatText(productionView.titel)"
              :title="productionView.titel || ''"
            />

            <p class="mt-2 text-sm text-zinc-500 flex items-center gap-2">
              <svg class="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ dateRangeText }}</span>
            </p>
          </div>

          <!-- removed chevron for a cleaner look -->
        </div>

        <!-- Tags -->
        <div class="mt-2 flex items-center gap-2">
          <div v-if="tags.length" class="flex flex-wrap items-center gap-2">
            <span
              v-for="tag in displayTags"
              :key="tag.id"
              class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium"
              :style="tagStyle"
            >
              {{ tag.tag }}
            </span>

            <span v-if="overflowCount > 0" class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-600">
              +{{ overflowCount }}
            </span>
          </div>

          <div v-else class="text-sm text-zinc-400">No tags</div>
        </div>

      </div>

    </article>
  </NuxtLink>
</template>

<style scoped>
[tabindex="0"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

/* make sure NuxtLink wrapper doesn't reset group hover */
.group:hover {
  text-decoration: none;
}

/* thumbnail subtle transitions and stronger baseline contrast */
.thumbnail {
  transition: box-shadow 180ms ease, border-color 180ms ease;
}

/* removed group hover rule to avoid thumbnail changing separately */
</style>
