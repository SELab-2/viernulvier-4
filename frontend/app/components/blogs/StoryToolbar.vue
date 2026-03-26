<!--
  components/blogs/StoryToolbar.vue
  ===================================
  This file implements the sort / filter toolbar shown below the StoriesHeader.
  It exposes two v-model bindings:
    - sortOrder   ("newest" | "oldest")  controls the sort direction
    - showFilter  (boolean)              toggles the filter panel visibility

  The story count display (loaded / total) gives the user a sense of how many
  items have been fetched so far vs. the total available on the server.
-->

<script lang="ts" setup>
const props = defineProps<{
  totalItems: number;
  loaded: number;
}>();

const sortOrder = defineModel<"newest" | "oldest">("sortOrder", { required: true });
const showFilter = defineModel<boolean>("showFilter", { required: true });

const { t } = useI18n();
</script>

<template>
  <div class="border-b border-border bg-background/95 backdrop-blur-sm sticky top-14 z-10">
    <div class="container mx-auto px-4 max-w-5xl py-3 flex items-center gap-2">

      <!-- Filter toggle button -->
      <button
        class="
          h-9 px-4 font-brand font-black text-[10px] uppercase tracking-widest
          border transition-colors duration-150 rounded flex items-center gap-2
          border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted
        "
        :class="showFilter ? 'border-foreground text-foreground bg-muted' : ''"
        @click="showFilter = !showFilter"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        Filter
      </button>

      <div class="flex-1" />

      <!-- Count: loaded / total -->
      <span class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
        {{ loaded }}
        <span v-if="totalItems > 0" class="text-border"> / {{ totalItems }}</span>
        {{ t("stories.results") }}
      </span>
    </div>

    <!-- Collapsible filter panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="showFilter"
        class="container mx-auto px-4 max-w-5xl pb-3 border-t border-border pt-3 flex items-center gap-3"
      >
        <!-- Sort order selector -->
        <select
          v-model="sortOrder"
          class="
            h-9 px-3 rounded bg-muted border-none
            text-[11px] font-brand font-black uppercase tracking-wide
            text-muted-foreground focus:outline-none cursor-pointer
          "
        >
          <option value="newest">{{ t("stories.sortNewest") }}</option>
          <option value="oldest">{{ t("stories.sortOldest") }}</option>
        </select>
      </div>
    </Transition>
  </div>
</template>