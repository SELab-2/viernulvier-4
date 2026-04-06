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

interface PrintsFile { //TODO replace this with actual object later
  id: number;
  name: string;
  year?: number;
  image?: string | null;
}

interface Props {
  category: string;
  files: PrintsFile[];
}
const props = defineProps<Props>();
const { t } = useI18n();

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const handleResize = () => {
  windowWidth.value = window.innerWidth
}
onMounted(() => {
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
const isExpanded = ref(false); // show more/less
const toggle = () => isOpen.value = !isOpen.value; // for toggling the whole category section  (chevrons)

const visibleFiles = computed(() => // visible files depend on if the show more button is pressed or not
    isExpanded.value ? props.files : props.files.slice(0, initialMax.value)
)
const remaining = computed(() => props.files.length - initialMax.value) // amount of non-visible files
const hasMore = computed(() => props.files.length > initialMax.value) // if a "show more"- button is needed

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
  <div class="m-4">
    <!-- Header -->
    <button
        class="w-full flex items-center gap-3 mb-3 group cursor-pointer"
        @click="toggle"
    >
      <span class="text-[20px] font-bold uppercase shrink-0">{{ category }}</span>
      <span class="text-[11px] text-muted-foreground shrink-0">{{ files.length }} {{ t('prints.files') }}</span>
      <span class="flex-1 h-px bg-border" />
      <ChevronUp v-if="isOpen" :size="14" :class="chevron" />
      <ChevronDown v-else :size="14" :class="chevron" />
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
                v-if="file.image && file.name.toLowerCase().endsWith('.pdf')"
                :src="file.image"
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
                v-else-if="file.image"
                :src="file.image"
                :alt="file.name"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                @click.stop="openFile(file.image!)"
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
            <p :class="[fileLabel, 'group-hover:text-accent transition-colors duration-150']">{{ file.name }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span
                  :class="[fileLabel, 'tracking-widest border border-border rounded px-1.5 py-0.5 text-muted-foreground']"
              >{{ category }}
              </span>
              <span v-if="file.year" class="text-[11px] text-muted-foreground ml-auto">{{ file.year }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Show more/less button -->
    <button v-if="hasMore || isExpanded"
            :class="showMoreButton"
            @click="isExpanded = !isExpanded">
      <span v-if="!isExpanded">{{ t('prints.showMore') }} ({{ remaining }} {{ t('prints.remaining') }})</span>
      <span v-else>{{ t('prints.showLess') }}</span>
    </button>
    <!-- No files (empty) -->
    <div
        v-else-if="!files.length"
        class="rounded-lg border border-border bg-card p-4 text-[12px] text-muted-foreground"
    >
      {{ t('prints.noFilesCat') }}
    </div>
  </div>
</template>

<style scoped>
</style>