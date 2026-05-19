<script setup lang="ts">
import { computed } from "vue";
import type { SeriesView } from "@repo/common";
import { ROUTES } from "~/utils/routes";

const props = withDefaults(
  defineProps<{
    serie: SeriesView;
    variant?: "badge" | "list";
  }>(),
  {
    variant: "badge",
  },
);

const { locale } = useI18n();

const title = computed(() => {
  if (!props.serie) return "";
  const titel = props.serie.titel;
  if (typeof titel === "string") return titel;
  return titel?.[locale.value as "en" | "nl"] || "";
});
</script>

<template>
  <NuxtLink
    v-if="props.variant === 'badge'"
    :to="ROUTES.series.byId(serie.id)"
    class="group/badge flex items-center gap-1.5 bg-background/80 backdrop-blur-md text-foreground border border-border/40 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm transition-colors hover:bg-background/90"
  >
    <svg
      class="w-3 h-3 text-muted-foreground group-hover/badge:text-accent transition-colors shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <path
        d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
      />
    </svg>
    <span
      class="max-w-[120px] truncate transition-colors group-hover/badge:text-accent"
    >
      {{ title }}
    </span>
  </NuxtLink>

  <NuxtLink
    v-else
    :to="ROUTES.series.byId(serie.id)"
    @click.prevent="$router.push(ROUTES.series.byId(serie.id))"
    class="group/item flex items-center gap-1.5 text-foreground hover:text-accent text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded-md hover:bg-muted transition-colors whitespace-nowrap"
  >
    <svg
      class="w-2.5 h-2.5 text-muted-foreground shrink-0 group-hover/item:text-accent transition-colors"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <path
        d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
      />
    </svg>
    <span class="max-w-[120px] truncate">
      {{ title }}
    </span>
  </NuxtLink>
</template>
