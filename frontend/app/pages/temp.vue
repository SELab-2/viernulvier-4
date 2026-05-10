<script setup lang="ts">
import type { ProductionView, SeriesView } from "@repo/common";

const seriesApi = useSeriesApi();
const { locale } = useI18n();

const SERIES_ID_1 = 2; // Series without productions on dev
const SERIES_ID_2 = 3; // Series without more productions on dev
const SERIES_ID_3 = 4; // Series with one production on dev

const series1 = ref<SeriesView | null>(null);
const productions1 = ref<ProductionView[]>([]);

const series2 = ref<SeriesView | null>(null);
const productions2 = ref<ProductionView[]>([]);

const series3 = ref<SeriesView | null>(null);
const productions3 = ref<ProductionView[]>([]);

onMounted(async () => {
  const [s1Res, p1Res, s2Res, p2Res, s3Res, p3Res] = await Promise.all([
    seriesApi.getById(SERIES_ID_1, locale.value),
    seriesApi.getSeriesProductions(SERIES_ID_1, locale.value),
    seriesApi.getById(SERIES_ID_2, locale.value),
    seriesApi.getSeriesProductions(SERIES_ID_2, locale.value),
    seriesApi.getById(SERIES_ID_3, locale.value),
    seriesApi.getSeriesProductions(SERIES_ID_3, locale.value),
  ]);

  if (s1Res.data) series1.value = s1Res.data as SeriesView;
  if (p1Res.data) productions1.value = (p1Res.data as any).objects ?? [];

  if (s2Res.data) series2.value = s2Res.data as SeriesView;
  if (p2Res.data) productions2.value = (p2Res.data as any).objects ?? [];

  if (s3Res.data) series3.value = s3Res.data as SeriesView;
  if (p3Res.data) productions3.value = (p3Res.data as any).objects ?? [];
});
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto flex flex-col gap-8">
    <SeriesScroller
      v-if="series1"
      :series="series1"
      :productions="productions1"
    />
    <br />
    <SeriesScroller
      v-if="series2"
      :series="series2"
      :productions="productions2"
    />
    <br />
    <SeriesScroller
      v-if="series3"
      :series="series3"
      :productions="productions3"
    />
  </div>
</template>

<style scoped></style>
