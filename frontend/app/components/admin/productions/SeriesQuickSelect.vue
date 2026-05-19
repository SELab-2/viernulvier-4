<!--
  components/admin/productions/SeriesQuickSelect.vue
  ====================================================
  A dropdown to quickly select all productions in a series for batch editing.
-->

<script setup lang="ts">
import { Layers, Search, Loader2, Check } from "lucide-vue-next";
import type { SeriesView } from "@repo/common";

const emit = defineEmits<{
  (e: "selected", seriesId: number): void;
}>();

const { t } = useI18n();
const seriesApi = useSeriesApi();

const isOpen = ref(false);
const searchQuery = ref("");
const results = ref<SeriesView[]>([]);
const loading = ref(false);

const dropdownRef = ref<HTMLElement | null>(null);

async function doSearch(query: string) {
  if (!query.trim()) {
    results.value = [];
    return;
  }
  loading.value = true;
  try {
    const resp = await seriesApi.getAll({
      seriesFilters: { title: query, is_suggestion: true },
      languageFilters: { lang: "nl" },
    });
    results.value = (resp.data as any)?.objects || [];
  } catch {
    results.value = [];
  } finally {
    loading.value = false;
  }
}

let debounce: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, (q) => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => doSearch(q), 300);
});

function selectSeries(series: SeriesView) {
  emit("selected", series.id);
  isOpen.value = false;
  searchQuery.value = "";
}

// Close on outside click
function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onUnmounted(() =>
  document.removeEventListener("mousedown", handleClickOutside),
);
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary border-2 border-secondary text-secondary-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-secondary transition"
      @click="isOpen = !isOpen"
    >
      <Layers :size="15" />
      {{ t("admin-productions.steps.series") }}
    </button>

    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden"
      >
        <div class="p-3 border-b border-border">
          <div class="relative">
            <Search
              :size="12"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              v-model="searchQuery"
              type="text"
              autofocus
              :placeholder="t('admin-productions.series.search-placeholder')"
              class="w-full h-9 pl-9 pr-3 rounded-md bg-muted border border-border text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>

        <div class="max-h-60 overflow-y-auto">
          <div v-if="loading" class="p-4 flex justify-center">
            <Loader2 :size="16" class="animate-spin text-muted-foreground" />
          </div>
          <div
            v-else-if="!results.length && searchQuery"
            class="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest"
          >
            {{ t("admin-productions.series.no-results") }}
          </div>
          <div
            v-else-if="!searchQuery"
            class="p-8 text-center text-[10px] text-muted-foreground uppercase tracking-widest"
          >
            {{ t("admin-productions.series.hint") }}
          </div>
          <ul v-else class="divide-y divide-border">
            <li
              v-for="series in results"
              :key="series.id"
              class="group flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted transition-colors"
              @click="selectSeries(series)"
            >
              <div class="min-w-0">
                <p
                  class="text-[11px] font-black uppercase tracking-tight text-foreground truncate italic"
                >
                  {{ series.titel }}
                </p>
                <p class="text-[9px] text-muted-foreground">
                  ID {{ series.id }}
                </p>
              </div>
              <Check
                :size="12"
                class="text-primary opacity-0 group-hover:opacity-100"
              />
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
