<script setup lang="ts">
/**
 * A reusable file grid component, displays files belonging to a specific category, includes:
 *  - Collapsible section with title and file count (chevron toggle)
 *  - Responsive grid (default: 4 items per row, can change to 3 -> 2)
 *  - Max 2 rows before a "show more" button appears (if there are more files)
 *  - File previews, clickable files
 *  - Thumbnail placeholders
 *
 * Usage:
 * <PrintsFileGrid
 *    category="Affiche"
 *    :files="files"
 * />
 *
 * Example files:
 * const files: PrintsFile[] = [
 *    { id: 1, name: 'AFFICHE-FESTIVAL-2025.PDF', year: 2025, image: null },
 *    { id: 2, name: 'AFFICHE-VIDEODROOM-2024.PDF', year: 2024, image: null },
 * ]
 */
import { ChevronUp, ChevronDown } from "lucide-vue-next";
import type { PrintItemView } from "@repo/common"

interface Props {
  category: string;
  files: PrintItemView[];
}
const props = defineProps<Props>();
const { t, locale } = useI18n();

const windowWidth = ref(1024)
const handleResize = () => {
  windowWidth.value = window.innerWidth
}
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const currentCols = computed(() => { // how many items there are currently in a row
  if (windowWidth.value >= 1024) return 4  // lg:grid-cols-4
  if (windowWidth.value >= 640) return 3   // sm:grid-cols-3
  return 2                                  // grid-cols-2
})

const initialMax = computed(() => currentCols.value * 2) // max items there can be in 2 rows

const isOpen = ref(true); // for toggling the whole category section  (chevrons)
const extraRows = ref(0) // how many extra rows to show
const visibleFiles = computed(() =>
    props.files.slice(0, initialMax.value + (extraRows.value * currentCols.value))
)
const remaining = computed(() => props.files.length - (initialMax.value + extraRows.value * currentCols.value)) // amount of non-visible files
const hasMore = computed(() => props.files.length > initialMax.value + (extraRows.value * currentCols.value)) // if a "show more"- button is needed

const toggle = () => {
  isOpen.value = !isOpen.value;
  extraRows.value = 0
} // for toggling the whole category section  (chevrons)

//constants
const chevron = "shrink-0 text-muted-foreground"
const fileLabel = "text-[11px] font-bold uppercase truncate"
const showMoreButton = "mt-4 w-full rounded-lg border border-border bg-card py-3 " +
    "text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center " +
    "hover:border-ring hover:text-foreground " +
    "transition-colors duration-150 cursor-pointer"

const openFile = (src: string) => window.open(src, '_blank') // for opening the PDF in a new browser tab
</script>

<template>
  <div>
    <!-- Header -->
    <button
        class="w-full flex items-center gap-3 mb-3 group cursor-pointer"
        @click="toggle"
    >
      <span class="text-[20px] font-bold uppercase shrink-0">{{ category }}</span>
      <span class="text-[11px] text-muted-foreground shrink-0">{{ files.length }} {{ t('prints.files') }}</span>
      <span class="flex-1 h-px bg-border" />
      <ChevronUp v-if="isOpen" :size="20" :class="chevron" />
      <ChevronDown v-else :size="20" :class="chevron" />
    </button>

    <!-- Grid -->
    <div v-if="isOpen && files.length">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
            v-for="file in visibleFiles"
            :key="file.id"
            class="group flex flex-col cursor-pointer"
        >
          <!-- Thumbnail -->
          <div class="relative w-full rounded-lg overflow-hidden border border-border aspect-[3/4] group-hover:border-accent/60 transition-colors duration-150">
            <PdfThumbnail
                v-if="file.url && file.titel.toLowerCase().endsWith('.pdf')"
                :src="file.url"
            >
              <template #fallback>
                <ThumbnailPlaceholder
                    :id="file.id"
                    size="fill"
                    :show-icon="true"
                    :show-border="false"
                    :rounded="false"
                />
              </template>
            </PdfThumbnail>
            <img
                v-else-if="file.url"
                :src="file.url"
                :alt="file.titel"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                @click.stop="file.url ? openFile(file.url) : undefined"
            />
            <ThumbnailPlaceholder
                v-else
                :id="file.id"
                size="fill"
                :show-icon="true"
                :show-border="false"
                :rounded="false"
            />
          </div>

          <!-- File info -->
          <div class="mt-2">
            <p :class="[fileLabel, 'group-hover:text-accent transition-colors duration-150']">{{ file.titel }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span
                  :class="[fileLabel, 'tracking-widest border border-border rounded px-1.5 py-0.5 text-muted-foreground']"
              >{{ category }}
              </span>
              <span v-if="file.created_at" class="text-[11px] text-muted-foreground ml-auto">
                {{ new Date(file.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Show more/less button -->
    <button v-if="isOpen && hasMore"
            :class="showMoreButton"
            @click="extraRows += 2">
      <span>{{ t('prints.showMore') }} ({{ remaining }} {{ t('prints.remaining') }})</span>
    </button>
    <!-- No files (empty) -->
    <div
        v-else-if="isOpen && !files.length"
        class="text-center text-gray-500 dark:text-gray-400"
    >
      {{ t('prints.noFilesCat') }}
    </div>
  </div>
</template>

<style scoped>
</style>