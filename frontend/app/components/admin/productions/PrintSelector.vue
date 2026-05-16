<!--
  components/admin/productions/PrintSelector.vue

  UI for searching and selecting Print Items to link to a production.
  Uses a search bar with visual suggestions and displays selected prints as a grid.
-->
<script setup lang="ts">
import { Search, Trash2, Link, Loader2, X } from "lucide-vue-next";
import type { PrintItemView } from "@repo/common";
import { usePrintApi } from "~/composables/media/usePrintApi";

const props = defineProps<{
  modelValue: PrintItemView[];
}>();

const emit = defineEmits<{
  "update:modelValue": [PrintItemView[]];
}>();

const { t, locale } = useI18n();
const printApi = usePrintApi();

const searchQuery = ref("");
const searchResults = ref<PrintItemView[]>([]);
const isSearching = ref(false);
const showDropdown = ref(false);

const linkedIds = computed(() => new Set(props.modelValue.map((p) => p.id)));

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!val.trim()) {
    searchResults.value = [];
    showDropdown.value = false;
    return;
  }
  searchTimeout = setTimeout(() => fetchPrints(val.trim()), 300);
});

async function fetchPrints(query: string) {
  isSearching.value = true;
  showDropdown.value = true;
  try {
    const res = await printApi.getAll({
      printItemFilters: { title: query, is_suggestion: true },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });

    if (res.data) {
      searchResults.value = res.data.objects ?? [];
    }
  } catch (err) {
    console.error("Failed to fetch prints", err);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

const filteredResults = computed(() =>
  searchResults.value.filter((p) => !linkedIds.value.has(p.id)),
);

function selectPrint(print: PrintItemView) {
  emit("update:modelValue", [...props.modelValue, print]);
  searchQuery.value = "";
  showDropdown.value = false;
}

function removePrint(id: number) {
  emit(
    "update:modelValue",
    props.modelValue.filter((p) => p.id !== id),
  );
}

function clearSearch() {
  searchQuery.value = "";
}

// ─── Click outside logic ─────────────────────────────────────────────────────
const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onClickOutside);
});

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    showDropdown.value = false;
  }
}
</script>

<template>
  <div class="space-y-6" ref="containerRef">
    <!-- Search Bar -->
    <div class="relative">
      <div class="relative flex items-center">
        <Search
          :size="14"
          class="pointer-events-none absolute left-3 text-muted-foreground"
        />
        <input
          v-model="searchQuery"
          type="text"
          class="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none placeholder:text-muted-foreground/50"
          :placeholder="t('admin-productions.media.searchPrints')"
          @focus="showDropdown = searchQuery.length > 0"
        />
        <button
          v-if="searchQuery"
          class="absolute right-3 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          @click="clearSearch"
        >
          <X :size="14" />
        </button>
      </div>

      <!-- Dropdown results -->
      <div
        v-if="showDropdown"
        class="absolute left-0 right-0 z-[100] mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <!-- Loading -->
        <div
          v-if="isSearching"
          class="flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          <Loader2 :size="12" class="animate-spin" />
          {{ t("admin-productions.media.searching") }}
        </div>

        <!-- No Results (either none found or all are already linked) -->
        <div
          v-else-if="
            (searchResults.length === 0 || filteredResults.length === 0) &&
            !isSearching &&
            searchQuery
          "
          class="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.media.noPrintsFound") }}
        </div>

        <!-- Results List -->
        <ul v-else class="max-h-80 divide-y divide-border overflow-y-auto">
          <li
            v-for="print in filteredResults"
            :key="print.id"
            class="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
            @mousedown.prevent="selectPrint(print)"
          >
            <div
              class="relative h-14 w-10 shrink-0 overflow-hidden rounded border border-border transition-colors group-hover:border-foreground/20"
            >
              <MediaDisplay :src="print" size="fill" class="h-full w-full" />
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-[11px] font-black uppercase tracking-widest text-foreground"
              >
                {{ print.titel }}
              </p>
              <p
                class="mt-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
              >
                {{ t(`prints.types.${print.print_type}`) }}
              </p>
            </div>
            <div
              class="flex shrink-0 items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-accent opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Link :size="10" stroke-width="3" />
              {{ t("admin-productions.series.link") }}
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Selected Prints Grid -->
    <div
      v-if="modelValue.length > 0"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      <div
        v-for="print in modelValue"
        :key="print.id"
        class="group relative flex flex-col"
      >
        <div
          class="relative aspect-[3/4] overflow-hidden rounded-lg border border-border transition-colors group-hover:border-accent/40"
        >
          <MediaDisplay :src="print" size="fill" />

          <!-- Remove overlay -->
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full bg-action-red-icon text-white transition-transform hover:scale-110"
              @click="removePrint(print.id)"
            >
              <Trash2 :size="14" stroke-width="2.5" />
            </button>
          </div>
        </div>
        <div class="mt-2">
          <p
            class="truncate text-[10px] font-black uppercase tracking-widest text-foreground"
          >
            {{ print.titel }}
          </p>
          <p
            class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {{ t(`prints.types.${print.print_type}`) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
