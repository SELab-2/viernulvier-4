<script lang="ts" setup>
const props = defineProps<{
  totalItems: number;
  loaded: number;
}>();

const sortOrder   = defineModel<"newest" | "oldest">("sortOrder",   { required: true });
const showFilter  = defineModel<boolean>("showFilter",              { required: true });
const searchQuery = defineModel<string>("searchQuery",              { default: "" });

const { t } = useI18n();
</script>

<template>
  <div class="relative border-b border-border bg-background">
    <div class="container mx-auto px-4 max-w-5xl py-3 flex items-center gap-2">

      <!-- Search input -->
      <div class="relative flex-1 max-w-xs">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="t('searchbar.placeholder')"
          class="
            w-full h-9 pl-9 pr-8
            bg-muted border border-border rounded
            font-brand font-black text-[10px] uppercase tracking-widest
            text-foreground placeholder:text-muted-foreground
            transition-colors duration-150 outline-none
            hover:border-foreground/20 hover:bg-muted/70
            focus:border-foreground/30 focus:bg-background
          "
        />
        <button
          v-if="searchQuery"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          type="button"
          :aria-label="t('stories.clearSearch')"
          @click="searchQuery = ''"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6"  y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Filter toggle button -->
      <button
        class="
          h-9 px-4 font-brand font-black text-[10px] uppercase tracking-widest
          border transition-colors duration-150 rounded flex items-center gap-2 shrink-0
          border-border text-muted-foreground
          hover:border-foreground hover:text-foreground hover:bg-muted
        "
        :class="showFilter ? 'border-foreground text-foreground bg-muted' : ''"
        @click="showFilter = !showFilter"
      >
        <svg
          class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"
        >
          <line x1="4"  y1="6"  x2="20" y2="6"  />
          <line x1="8"  y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        Filter
      </button>

      <!-- Inline sort-dropdown -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <select
          v-if="showFilter"
          v-model="sortOrder"
          class="
            h-9 px-3 rounded bg-muted border border-border
            text-[10px] font-brand font-black uppercase tracking-widest
            text-muted-foreground focus:outline-none cursor-pointer shrink-0
            transition-colors hover:border-foreground/30
          "
        >
          <option value="newest">{{ t("stories.sortNewest") }}</option>
          <option value="oldest">{{ t("stories.sortOldest") }}</option>
        </select>
      </Transition>

    </div>
  </div>
</template>