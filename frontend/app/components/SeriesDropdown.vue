<script setup lang="ts">
import type { SeriesView } from "@repo/common";
import SeriesLabel from "./SeriesLabel.vue";

const props = withDefaults(
  defineProps<{
    seriesList: SeriesView[];
    align?: "left" | "right";
  }>(),
  {
    align: "left",
  },
);
</script>

<template>
  <div v-if="props.seriesList?.length" class="shrink-0">
    <SeriesLabel
      v-if="props.seriesList.length === 1"
      :serie="props.seriesList[0]"
      variant="badge"
    />

    <div
      v-else
      class="relative group/series-dropdown inline-block"
      @click.prevent
    >
      <div
        class="inline-flex items-center gap-1.5 bg-background/90 backdrop-blur-md text-foreground border border-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm cursor-pointer transition-colors hover:text-accent"
      >
        <svg
          class="w-3 h-3 text-muted-foreground transition-colors group-hover/series-dropdown:text-accent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
          />
        </svg>
        <span> {{ props.seriesList.length }} series </span>
      </div>

      <div
        class="absolute top-full hidden group-hover/series-dropdown:flex flex-col gap-1 pt-1 z-30"
        :class="props.align === 'right' ? 'right-0' : 'left-0'"
      >
        <div
          class="flex flex-col gap-1 bg-background/95 backdrop-blur-md border border-border p-1.5 rounded-lg shadow-lg min-w-[140px] max-h-[200px] overflow-y-auto [scrollbar-width:thin] animate-in fade-in slide-in-from-top-1 duration-100"
        >
          <SeriesLabel
            v-for="series in props.seriesList"
            :key="series.id"
            :serie="series"
            variant="list"
          />
        </div>
      </div>
    </div>
  </div>
</template>
