<script setup lang="ts">
import type { SeriesView } from "@repo/common";
import { ROUTES } from "~/utils/routes";

const props = withDefaults(
  defineProps<{
    seriesList: SeriesView[];
    align?: "left" | "right";
  }>(),
  {
    align: "left",
  },
);

const { locale } = useI18n();

function getSeriesTitle(series: SeriesView) {
  if (!series) return "";
  const titel = series.titel;
  if (typeof titel === "string") return titel;
  return titel?.[locale.value as "en" | "nl"] || "";
}
</script>

<template>
  <div v-if="props.seriesList?.length" class="shrink-0">
    <NuxtLink
      v-if="props.seriesList.length === 1"
      :to="ROUTES.series.byId(props.seriesList[0].id)"
      @click.prevent="$router.push(ROUTES.series.byId(props.seriesList[0].id))"
      class="group/single-badge inline-flex items-center gap-1.5 bg-background/90 backdrop-blur-md text-foreground hover:text-accent border border-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm transition-all hover:bg-background"
    >
      <svg
        class="w-3 h-3 text-muted-foreground group-hover/single-badge:text-accent transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <path
          d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
        />
      </svg>
      <span class="max-w-[120px] truncate">{{
        getSeriesTitle(props.seriesList[0])
      }}</span>
    </NuxtLink>

    <div
      v-else
      class="relative group/series-dropdown inline-block"
      @click.prevent
    >
      <div
        class="inline-flex items-center gap-1.5 bg-background/90 backdrop-blur-md text-foreground hover:text-accent border border-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm cursor-pointer transition-colors"
      >
        <svg
          class="w-3 h-3 text-muted-foreground group-hover/series-dropdown:text-accent transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
          />
        </svg>
        <span>{{ props.seriesList.length }} series</span>
      </div>

      <div
        class="absolute top-full hidden group-hover/series-dropdown:flex flex-col gap-1 pt-1 z-30"
        :class="props.align === 'right' ? 'right-0' : 'left-0'"
      >
        <div
          class="flex flex-col gap-1 bg-background/95 backdrop-blur-md border border-border p-1.5 rounded-lg shadow-lg min-w-[140px] max-h-[200px] overflow-y-auto [scrollbar-width:thin] animate-in fade-in slide-in-from-top-1 duration-100"
        >
          <NuxtLink
            v-for="series in props.seriesList"
            :key="series.id"
            :to="ROUTES.series.byId(series.id)"
            @click.prevent="$router.push(ROUTES.series.byId(series.id))"
            class="group/item flex items-center gap-1.5 text-foreground hover:text-accent-hover text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded-md hover:bg-muted transition-colors whitespace-nowrap"
          >
            <svg
              class="w-2.5 h-2.5 text-muted-foreground shrink-0 group-hover/item:text-accent-hover transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
              />
            </svg>
            <span class="max-w-[120px] truncate">{{
              getSeriesTitle(series)
            }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
