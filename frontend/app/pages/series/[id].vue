<!--
  pages/series/[id].vue
  ========================
  Series detail page.

  - Reuses the ProductionListViewItem from the archive section
  - Fetches paginated production items from the API (15 items/page)

-->

<script setup lang="ts">
import type {
  PaginatedResponse,
  ProductionView,
  SeriesView,
} from "@repo/common";
import { useSeriesApi } from "~/composables/useSeriesApi";
import { ROUTES } from "~/utils/routes";
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import { ChevronLeft } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const seriesApi = useSeriesApi();
const { t, locale } = useI18n();

const seriesId = computed(() => Number(route.params.id));

const series = ref<SeriesView | null>(null);
const productions = ref<ProductionView[]>([]);

const { currentPage, totalPages, totalItems, loading } =
  useSeriesProductionsView();
const limit = 15;

const isExpanded = ref(false);
const showReadMoreButton = ref(false);
const descriptionRef = ref<HTMLElement | null>(null);

const checkOverflow = () => {
  if (descriptionRef.value) {
    showReadMoreButton.value =
      descriptionRef.value.scrollHeight > descriptionRef.value.clientHeight;
  }
};

let observer: ResizeObserver | null = null;

async function loadPage() {
  loading.value = true;
  const [seriesResp, productionsResp] = await Promise.all([
    seriesApi.getById(seriesId.value, locale.value),
    seriesApi.getSeriesProductions(seriesId.value, locale.value, {
      page: currentPage.value - 1,
      limit,
      descending: false,
    }),
  ]);
  if (seriesResp.data) series.value = seriesResp.data as SeriesView;
  if (productionsResp.data) {
    const data = productionsResp.data as PaginatedResponse<ProductionView>;
    productions.value = (data.objects ?? []) as ProductionView[];
    totalItems.value = data.totalItems ?? 0;
    totalPages.value = Math.max(1, Math.ceil(totalItems.value / limit));
  }

  loading.value = false;
  await nextTick(); // waiting for DOM to finish updating
  checkOverflow();
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(ROUTES.series.base);
  }
};

watch(seriesId, () => {
  currentPage.value = 1;
});
watch([seriesId, locale, currentPage], loadPage);

onMounted(async () => {
  observer = new ResizeObserver(() => checkOverflow());
  await loadPage();
  if (descriptionRef.value) observer.observe(descriptionRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <!-- Header section -->
    <section class="w-full border-b border-border bg-muted py-16 lg:py-24">
      <div class="page-container w-full">
        <button
          @click="goBack()"
          class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] hover:text-accent transition-colors mb-8"
        >
          <ChevronLeft :size="14" stroke-width="3" />
          {{ t("general.back") }}
        </button>

        <!-- Header -->
        <div class="flex flex-col gap-6">
          <div class="flex items-end justify-between gap-6 flex-wrap">
            <h1
              class="font-brand font-black uppercase italic leading-[0.85] tracking-[-3px] text-5xl lg:text-7xl"
            >
              {{ series?.titel }}
            </h1>

            <div
              class="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-black shrink-0"
            >
              {{ totalItems }} {{ t("nav.productions") }}
            </div>
          </div>

          <div v-if="series?.description">
            <p
              ref="descriptionRef"
              class="max-w-5xl text-lg lg:text-xl leading-relaxed text-muted-foreground whitespace-pre-line break-words transition-all duration-500"
              :class="[
                isExpanded ? 'line-clamp-none' : 'line-clamp-[6]',
                showReadMoreButton && !isExpanded ? 'should-fade' : '',
              ]"
            >
              {{ series.description }}
            </p>

            <button
              v-if="showReadMoreButton || isExpanded"
              @click="isExpanded = !isExpanded"
              class="mt-6 text-[11px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
            >
              {{ isExpanded ? t("general.readLess") : t("general.readMore") }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Content section -->
    <section class="py-20">
      <div class="page-container">
        <!-- Production ListView -->
        <template v-if="series">
          <div v-if="productions.length" class="flex flex-col gap-3">
            <ProductionListViewItem
              v-for="production in productions"
              :key="production.id"
              :production-view="production"
            />
          </div>

          <!-- Empty -->
          <div v-else class="text-center text-muted-foreground py-12 italic">
            {{ t("series.noProductions") }}
          </div>
        </template>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between mt-16"
        >
          <SeriesPageJumper />
          <SeriesPagination />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.should-fade {
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

.line-clamp-none {
  mask-image: none !important;
  -webkit-mask-image: none !important;
}
</style>
