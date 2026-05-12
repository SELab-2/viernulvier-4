<script setup lang="ts">
import type {
  PaginatedResponse,
  ProductionView,
  SeriesView,
} from "@repo/common";

const seriesApi = useSeriesApi();
const { locale, t } = useI18n();

const SERIES_ID_1 = 2; // Series without productions on dev
const SERIES_ID_2 = 3; // Series without more productions on dev
const SERIES_ID_3 = 4; // Series with one production on dev
const SERIES_ID_4 = 5; // Series with a lot of productions on dev (to check pagination)

const seriesList = ref<{ series: SeriesView; totalItems: number }[]>([]);

async function loadAll() {
  const ids = [SERIES_ID_1, SERIES_ID_2, SERIES_ID_3, SERIES_ID_4];

  const results = await Promise.all(
    ids.map((id) =>
      Promise.all([
        seriesApi.getById(id, locale.value),
        seriesApi.getSeriesProductions(id, locale.value),
      ]),
    ),
  );

  seriesList.value = results
    .map(([sRes, pRes]) => {
      const series = sRes.data as SeriesView | null;
      const paginated = pRes.data as PaginatedResponse<ProductionView>;
      const totalItems = paginated?.totalItems ?? 0;
      return series ? { series, totalItems } : null;
    })
    .filter(Boolean) as { series: SeriesView; totalItems: number }[];
}

watch(locale, loadAll);
onMounted(loadAll);
</script>

<template>
  <div class="page-container py-8 flex flex-col gap-8">
    <div v-if="seriesList.length" class="flex flex-wrap gap-6">
      <SeriesFolder
        v-for="item in seriesList"
        :key="item.series.id"
        :series="item.series"
        :production-count="item.totalItems"
      />
    </div>
  </div>
</template>

<style scoped></style>
