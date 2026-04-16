<script setup lang="ts">
import type { PrintItemView, PaginatedResponse, PrintType } from "@repo/common";
import { PrintTypeValues } from "@repo/common";
import { usePrintApi } from "../../composables/usePrintApi";
import PrintsHeader from "../../components/prints/PrintsHeader.vue";
import PrintsToolbar from "../../components/prints/PrintsToolbar.vue";
import PrintsSkeleton from "../../components/prints/PrintsSkeleton.vue";

const { t, locale } = useI18n();
const { getAll } = usePrintApi();

// Filters
const searchQuery = ref("");

// Pagination state
const LIMIT = 16; // max amount of items on a page on full screen
const page = ref(0);
const totalItems = ref(0);
const prints = ref<PrintItemView[]>([]);
const pending = ref(false);
const fetchError = ref<Error | null>(null);

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
        limit: LIMIT,
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

const activeFilter = ref<PrintType>(PrintTypeValues[0]);

watch([searchQuery, locale, activeFilter], () => {
  page.value = 0;
  loadPage();
});

onMounted(loadPage);
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

      <template v-else>
        <PrintsFileGrid :category="activeFilter" :files="prints" />
      </template>
    </main>
  </div>
</template>

<style scoped></style>
