<script setup lang="ts">
import type { PrintItemView, PaginatedResponse, PrintType } from "@repo/common";
import { PrintTypeValues } from "@repo/common";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { usePrintApi } from "../../composables/usePrintApi";
import PrintsHeader from "../../components/prints/PrintsHeader.vue";
import PrintsToolbar from "../../components/prints/PrintsToolbar.vue";
import PrintsSkeleton from "../../components/prints/PrintsSkeleton.vue";
import FileGrid from "../../components/prints/FileGrid.vue";

const { t, locale } = useI18n();
const { getAll } = usePrintApi();

// Filters
const searchQuery = ref("");
const activeFilter = ref<PrintType>(PrintTypeValues[0]);

// Responsive columns
const ROWS_PER_PAGE = 4;
const windowWidth = ref(1024);
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const currentCols = computed(() => {
  // how many items there are currently in a row
  if (windowWidth.value >= 1024) return 4; // lg:grid-cols-4
  if (windowWidth.value >= 640) return 3; // sm:grid-cols-3
  return 2; // grid-cols-2
});
const LIMIT = computed(() => ROWS_PER_PAGE * currentCols.value);

// Pagination state
const page = ref(0);
const totalItems = ref(0);
const prints = ref<PrintItemView[]>([]);
const pending = ref(false);
const fetchError = ref<Error | null>(null);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / LIMIT.value)),
);

function goToPage(p: number) {
  if (p < 0 || p >= totalPages.value) return;
  page.value = p;
  loadPage();
}

function unwrap(result: unknown): PaginatedResponse<PrintItemView> | null {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object)) return r as any;
  return null;
}

async function loadPage() {
  pending.value = true;
  fetchError.value = null;

  try {
    const raw = await getAll({
      paginationFilters: {
        page: page.value,
        limit: LIMIT.value,
        descending: true,
      },
      printFilters: {
        type: activeFilter.value,
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
      },
    });

    const paged = unwrap(raw);
    prints.value = (paged?.objects ?? []) as PrintItemView[];
    totalItems.value = paged?.totalItems ?? 0;
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    pending.value = false;
  }
}

watch([searchQuery, locale, activeFilter], () => {
  page.value = 0;
  loadPage();
});

onMounted(loadPage);

// constants
const chevronButton =
  "w-9 h-9 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:cursor-default";
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-[#151821] text-gray-900 dark:text-gray-100 transition-colors duration-200"
  >
    <PrintsHeader />

    <PrintsToolbar
      @update:search="searchQuery = $event"
      @update:types="activeFilter = $event"
    />

    <main class="container mx-auto px-4 max-w-5xl pt-4 pb-8 sm:pt-6 sm:pb-12">
      <PrintsSkeleton v-if="pending" />

      <div v-else-if="fetchError" class="py-24 text-center space-y-4">
        <p
          class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-20"
        >
          {{ t("prints.noPrints") }}
        </p>
        <p
          class="font-brand font-black text-[10px] uppercase tracking-widest text-red-400"
        >
          {{ fetchError.message }}
        </p>
        <button
          class="mt-4 px-6 py-3 border font-brand font-black text-[11px] uppercase tracking-widest transition-all border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted"
          @click="loadPage()"
        >
          {{ t("prints.retry") }}
        </button>
      </div>

      <FileGrid
        :category="activeFilter"
        :files="prints"
        :total-files="totalItems"
      />

      <!-- Pagination -->
      <div class="flex items-center justify-center gap-2 mt-6 h-9">
        <button
          :class="chevronButton"
          :disabled="page === 1"
          @click="goToPage(page - 1)"
        >
          <ChevronLeft :size="16" />
        </button>

        <span
          v-if="totalPages > 1"
          class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2"
        >
          {{ page }} / {{ totalPages }}
        </span>

        <button
          :class="chevronButton"
          :disabled="page === totalPages"
          @click="goToPage(page + 1)"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
